<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ledger;
use Illuminate\Http\Request;

class LedgerController extends Controller
{
    public function index(Request $request)
    {
        $ledgers = Ledger::where('user_id', $request->user()->id)
            ->with('journalLines')
            ->orderBy('name')
            ->get()
            ->map(fn (Ledger $ledger) => $this->formatLedger($ledger));

        return response()->json($ledgers);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'opening_debit' => ['nullable', 'numeric', 'min:0'],
            'opening_credit' => ['nullable', 'numeric', 'min:0'],
        ]);

        $ledger = Ledger::create([
            'user_id' => $request->user()->id,
            'name' => $data['name'],
            'category' => $data['category'] ?? null,
            'opening_debit' => $data['opening_debit'] ?? 0,
            'opening_credit' => $data['opening_credit'] ?? 0,
        ]);

        return response()->json($this->formatLedger($ledger), 201);
    }

    public function show(Request $request, Ledger $ledger)
    {
        abort_unless($ledger->user_id === $request->user()->id, 404);

        return response()->json($this->formatLedger($ledger->load('journalLines')));
    }

    public function destroy(Request $request, Ledger $ledger)
    {
        abort_unless($ledger->user_id === $request->user()->id, 404);
        $ledger->delete();

        return response()->json(['message' => 'Ledger deleted']);
    }

    private function formatLedger(Ledger $ledger): array
    {
        $debit = (float) $ledger->opening_debit + (float) $ledger->journalLines->where('type', 'debit')->sum('amount');
        $credit = (float) $ledger->opening_credit + (float) $ledger->journalLines->where('type', 'credit')->sum('amount');

        return [
            'id' => $ledger->id,
            'name' => $ledger->name,
            'category' => $ledger->category,
            'opening_debit' => (float) $ledger->opening_debit,
            'opening_credit' => (float) $ledger->opening_credit,
            'debit' => $debit,
            'credit' => $credit,
            'balance' => $debit - $credit,
        ];
    }
}

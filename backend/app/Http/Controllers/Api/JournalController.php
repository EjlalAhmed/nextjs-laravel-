<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use App\Models\Ledger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JournalController extends Controller
{
    public function index(Request $request)
    {
        $query = JournalEntry::where('user_id', $request->user()->id)
            ->with(['lines.ledger'])
            ->orderByDesc('entry_date')
            ->orderByDesc('id');

        if ($request->filled('month')) {
            $query->whereMonth('entry_date', $request->integer('month'));
        }

        if ($request->filled('date')) {
            $query->whereDate('entry_date', $request->date('date'));
        }

        return response()->json($query->get()->map(fn (JournalEntry $entry) => $this->formatEntry($entry)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'entry_date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:255'],
            'reference_no' => ['nullable', 'string', 'max:255'],
            'debit_ledger_id' => ['required', 'exists:ledgers,id'],
            'credit_ledger_id' => ['required', 'exists:ledgers,id', 'different:debit_ledger_id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        $userId = $request->user()->id;

        Ledger::where('user_id', $userId)->whereIn('id', [$data['debit_ledger_id'], $data['credit_ledger_id']])->count() === 2
            ?: abort(422, 'Selected ledgers are invalid.');

        $entry = DB::transaction(function () use ($data, $userId) {
            $entry = JournalEntry::create([
                'user_id' => $userId,
                'entry_date' => $data['entry_date'],
                'reference_no' => $data['reference_no'] ?? null,
                'description' => $data['description'],
            ]);

            $entry->lines()->createMany([
                ['ledger_id' => $data['debit_ledger_id'], 'type' => 'debit', 'amount' => $data['amount']],
                ['ledger_id' => $data['credit_ledger_id'], 'type' => 'credit', 'amount' => $data['amount']],
            ]);

            return $entry->load('lines.ledger');
        });

        return response()->json($this->formatEntry($entry), 201);
    }

    public function destroy(Request $request, JournalEntry $journal)
    {
        abort_unless($journal->user_id === $request->user()->id, 404);
        $journal->delete();

        return response()->json(['message' => 'Journal entry deleted']);
    }

    private function formatEntry(JournalEntry $entry): array
    {
        $debitLine = $entry->lines->firstWhere('type', 'debit');
        $creditLine = $entry->lines->firstWhere('type', 'credit');

        return [
            'id' => $entry->id,
            'entry_date' => $entry->entry_date->toDateString(),
            'reference_no' => $entry->reference_no,
            'description' => $entry->description,
            'debit' => (float) $entry->lines->where('type', 'debit')->sum('amount'),
            'credit' => (float) $entry->lines->where('type', 'credit')->sum('amount'),
            'first_ledger' => $debitLine?->ledger?->name,
            'second_ledger' => $creditLine?->ledger?->name,
            'lines' => $entry->lines->map(fn ($line) => [
                'ledger_id' => $line->ledger_id,
                'ledger_name' => $line->ledger?->name,
                'type' => $line->type,
                'amount' => (float) $line->amount,
            ])->values(),
        ];
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use App\Models\Ledger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccountingReportController extends Controller
{
    public function trialSheet(Request $request)
    {
        $queryDate = $request->date('date');
        $month = $request->integer('month') ?: null;

        $ledgers = Ledger::where('user_id', $request->user()->id)
            ->with(['journalLines.entry'])
            ->orderBy('id')
            ->get()
            ->map(function (Ledger $ledger) use ($queryDate, $month) {
                $lines = $ledger->journalLines->filter(function ($line) use ($queryDate, $month) {
                    if ($queryDate && ! $line->entry->entry_date->isSameDay($queryDate)) {
                        return false;
                    }

                    if ($month && (int) $line->entry->entry_date->format('n') !== $month) {
                        return false;
                    }

                    return true;
                });

                $movementDebit = (float) $lines->where('type', 'debit')->sum('amount');
                $movementCredit = (float) $lines->where('type', 'credit')->sum('amount');
                $closing = (float) $ledger->opening_debit - (float) $ledger->opening_credit + $movementDebit - $movementCredit;

                return [
                    'id' => $ledger->id,
                    'name' => $ledger->name,
                    'opening_debit' => (float) $ledger->opening_debit,
                    'opening_credit' => (float) $ledger->opening_credit,
                    'movement_debit' => $movementDebit,
                    'movement_credit' => $movementCredit,
                    'closing_debit' => $closing >= 0 ? $closing : 0,
                    'closing_credit' => $closing < 0 ? abs($closing) : 0,
                ];
            });

        return response()->json($ledgers);
    }

    public function ledgerStatement(Request $request, Ledger $ledger)
    {
        abort_unless($ledger->user_id === $request->user()->id, 404);

        $queryDate = $request->date('date');
        $month = $request->integer('month') ?: null;
        $runningBalance = (float) $ledger->opening_debit - (float) $ledger->opening_credit;

        $lines = $ledger->journalLines()
            ->with(['entry.lines.ledger'])
            ->get()
            ->filter(function ($line) use ($queryDate, $month) {
                if ($queryDate && ! $line->entry->entry_date->isSameDay($queryDate)) {
                    return false;
                }

                if ($month && (int) $line->entry->entry_date->format('n') !== $month) {
                    return false;
                }

                return true;
            })
            ->sortBy(fn ($line) => $line->entry->entry_date->format('Y-m-d') . '-' . $line->entry->id)
            ->values()
            ->map(function ($line) use (&$runningBalance) {
                $runningBalance += $line->type === 'debit' ? (float) $line->amount : -1 * (float) $line->amount;
                $opposite = $line->entry->lines->first(fn ($entryLine) => $entryLine->ledger_id !== $line->ledger_id);

                return [
                    'id' => $line->id,
                    'entry_id' => $line->entry->id,
                    'entry_date' => $line->entry->entry_date->toDateString(),
                    'reference' => $opposite?->ledger?->name,
                    'reference_no' => $line->entry->reference_no,
                    'description' => $line->entry->description,
                    'debit' => $line->type === 'debit' ? (float) $line->amount : 0,
                    'credit' => $line->type === 'credit' ? (float) $line->amount : 0,
                    'balance' => $runningBalance,
                ];
            });

        return response()->json([
            'ledger' => [
                'id' => $ledger->id,
                'name' => $ledger->name,
                'opening_balance' => (float) $ledger->opening_debit - (float) $ledger->opening_credit,
                'closing_balance' => $runningBalance,
            ],
            'entries' => $lines,
        ]);
    }

    public function importCsv(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt'],
        ]);

        $userId = $request->user()->id;
        $handle = fopen($request->file('file')->getRealPath(), 'r');
        $header = array_map('strtolower', array_map('trim', fgetcsv($handle) ?: []));
        $created = 0;

        DB::transaction(function () use ($handle, $header, $userId, &$created) {
            while (($row = fgetcsv($handle)) !== false) {
                $data = array_combine($header, $row);

                if (! $data || empty($data['debit_ledger']) || empty($data['credit_ledger']) || empty($data['amount'])) {
                    continue;
                }

                $debitLedger = Ledger::firstOrCreate(
                    ['user_id' => $userId, 'name' => trim($data['debit_ledger'])],
                    ['category' => 'Imported']
                );

                $creditLedger = Ledger::firstOrCreate(
                    ['user_id' => $userId, 'name' => trim($data['credit_ledger'])],
                    ['category' => 'Imported']
                );

                $entry = JournalEntry::create([
                    'user_id' => $userId,
                    'entry_date' => $data['date'] ?: now()->toDateString(),
                    'reference_no' => $data['reference_no'] ?? null,
                    'description' => $data['description'] ?? 'Imported entry',
                ]);

                $entry->lines()->createMany([
                    ['ledger_id' => $debitLedger->id, 'type' => 'debit', 'amount' => (float) $data['amount']],
                    ['ledger_id' => $creditLedger->id, 'type' => 'credit', 'amount' => (float) $data['amount']],
                ]);

                $created++;
            }
        });

        fclose($handle);

        return response()->json(['message' => "{$created} entries imported", 'created' => $created]);
    }

    public function exportCsv(Request $request)
    {
        $entries = JournalEntry::where('user_id', $request->user()->id)
            ->with(['lines.ledger'])
            ->orderBy('entry_date')
            ->get();

        $callback = function () use ($entries) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['date', 'description', 'reference_no', 'debit_ledger', 'credit_ledger', 'amount']);

            foreach ($entries as $entry) {
                $debitLine = $entry->lines->firstWhere('type', 'debit');
                $creditLine = $entry->lines->firstWhere('type', 'credit');
                fputcsv($file, [
                    $entry->entry_date->toDateString(),
                    $entry->description,
                    $entry->reference_no,
                    $debitLine?->ledger?->name,
                    $creditLine?->ledger?->name,
                    $debitLine?->amount,
                ]);
            }

            fclose($file);
        };

        return response()->streamDownload($callback, 'ledger-export.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }
}

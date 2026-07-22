<?php

namespace Database\Seeders;

use App\Models\Budget;
use App\Models\Category;
use App\Models\JournalEntry;
use App\Models\Ledger;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
            ],
        );

        Transaction::where('user_id', $user->id)->delete();
        Budget::where('user_id', $user->id)->delete();
        Category::where('user_id', $user->id)->delete();
        JournalEntry::where('user_id', $user->id)->delete();
        Ledger::where('user_id', $user->id)->delete();

        $incomeCategories = collect(['Salary', 'Freelance', 'Bonus', 'Investment'])
            ->mapWithKeys(fn (string $name) => [
                $name => Category::create([
                    'user_id' => $user->id,
                    'name' => $name,
                    'type' => 'income',
                ]),
            ]);

        $expenseCategories = collect(['Food', 'Rent', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment'])
            ->mapWithKeys(fn (string $name) => [
                $name => Category::create([
                    'user_id' => $user->id,
                    'name' => $name,
                    'type' => 'expense',
                ]),
            ]);

        $currentMonth = now()->month;
        $currentYear = now()->year;

        $budgets = [
            'Food' => 35000,
            'Rent' => 70000,
            'Transport' => 18000,
            'Shopping' => 25000,
            'Bills' => 22000,
            'Health' => 12000,
            'Entertainment' => 15000,
        ];

        foreach ($budgets as $categoryName => $amount) {
            Budget::create([
                'user_id' => $user->id,
                'category_id' => $expenseCategories[$categoryName]->id,
                'amount' => $amount,
                'month' => $currentMonth,
                'year' => $currentYear,
            ]);
        }

        $incomeTransactions = [
            ['Salary', 180000, 'Monthly salary', now()->subDays(2)],
            ['Freelance', 45000, 'Website project payment', now()->subDays(9)],
            ['Bonus', 25000, 'Performance bonus', now()->subDays(18)],
            ['Investment', 12000, 'Dividend income', now()->subDays(32)],
        ];

        foreach ($incomeTransactions as [$categoryName, $amount, $description, $date]) {
            Transaction::create([
                'user_id' => $user->id,
                'category_id' => $incomeCategories[$categoryName]->id,
                'type' => 'income',
                'amount' => $amount,
                'description' => $description,
                'transaction_date' => $date->toDateString(),
            ]);
        }

        $expenseTemplates = [
            ['Rent', 70000, 'Apartment rent'],
            ['Food', 4200, 'Groceries'],
            ['Transport', 1800, 'Fuel and ride fare'],
            ['Shopping', 6500, 'Clothes shopping'],
            ['Bills', 9500, 'Electricity bill'],
            ['Health', 3500, 'Medicine'],
            ['Entertainment', 2800, 'Movie night'],
            ['Food', 2200, 'Dinner outside'],
            ['Transport', 1400, 'Careem ride'],
            ['Bills', 4500, 'Internet bill'],
            ['Shopping', 3200, 'Home items'],
            ['Food', 5800, 'Monthly grocery refill'],
            ['Health', 5000, 'Doctor checkup'],
            ['Entertainment', 4000, 'Weekend outing'],
        ];

        foreach ($expenseTemplates as $index => [$categoryName, $amount, $description]) {
            Transaction::create([
                'user_id' => $user->id,
                'category_id' => $expenseCategories[$categoryName]->id,
                'type' => 'expense',
                'amount' => $amount,
                'description' => $description,
                'transaction_date' => now()->subDays($index * 3 + 1)->toDateString(),
            ]);
        }

        $ledgers = collect([
            ['opening balance', 'Capital', 3590, 0],
            ['personal amount', 'Asset', 0, 0],
            ['loan', 'Liability', 0, 0],
            ['transport and velo', 'Expense', 0, 0],
        ])->mapWithKeys(fn (array $ledger) => [
            $ledger[0] => Ledger::create([
                'user_id' => $user->id,
                'name' => $ledger[0],
                'category' => $ledger[1],
                'opening_debit' => $ledger[2],
                'opening_credit' => $ledger[3],
            ]),
        ]);

        $journalEntries = [
            [now()->subDays(2), 'zia ka loan', null, 'loan', 'personal amount', 5000],
            [now()->subDays(2), 'zia ka loan return', null, 'personal amount', 'loan', 1000],
            [now()->subDays(2), 'zia ka loan', null, 'loan', 'personal amount', 1000],
            [now()->subDay(), 'office transport and velo', null, 'transport and velo', 'personal amount', 1000],
        ];

        foreach ($journalEntries as [$date, $description, $referenceNo, $debitLedger, $creditLedger, $amount]) {
            $entry = JournalEntry::create([
                'user_id' => $user->id,
                'entry_date' => $date->toDateString(),
                'reference_no' => $referenceNo,
                'description' => $description,
            ]);

            $entry->lines()->createMany([
                ['ledger_id' => $ledgers[$debitLedger]->id, 'type' => 'debit', 'amount' => $amount],
                ['ledger_id' => $ledgers[$creditLedger]->id, 'type' => 'credit', 'amount' => $amount],
            ]);
        }
    }
}

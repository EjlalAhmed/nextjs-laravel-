<?php

namespace Database\Seeders;

use App\Models\JournalEntry;
use App\Models\Ledger;
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
                'role' => User::ROLE_SUPER_ADMIN,
            ],
        );

        JournalEntry::where('user_id', $user->id)->delete();
        Ledger::where('user_id', $user->id)->delete();

        $ledgers = collect([
            ['loan', 'Liability', 0, 5000],
            ['personal amount', 'Asset', 4043, 0],
            ['transport and velo', 'Expense', 1000, 0],
            ['opening balance', 'Capital', 0, 3590],
            ['bill pay KE', 'Expense', 1547, 0],
            ['mobile package', 'Expense', 2000, 0],
        ])->mapWithKeys(fn (array $ledger) => [
            $ledger[0] => Ledger::create([
                'user_id' => $user->id,
                'name' => $ledger[0],
                'category' => $ledger[1],
                'opening_debit' => $ledger[2],
                'opening_credit' => $ledger[3],
            ]),
        ]);
    }
}

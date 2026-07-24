<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $hasSuperAdmin = DB::table('users')->where('role', 'super_admin')->exists();

        if (! $hasSuperAdmin) {
            $firstUser = DB::table('users')->orderBy('id')->first();

            if ($firstUser) {
                DB::table('users')
                    ->where('id', $firstUser->id)
                    ->update(['role' => 'super_admin']);
            }
        }
    }

    public function down(): void
    {
        //
    }
};

<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AccountingReportController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\LedgerController;
use App\Http\Controllers\Api\JournalController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['api.auth'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::apiResource('/transactions', TransactionController::class);
    Route::apiResource('/categories', CategoryController::class);
    Route::apiResource('/budgets', BudgetController::class);

    Route::get('/reports/monthly', [ReportController::class, 'monthly']);
    Route::get('/reports/yearly', [ReportController::class, 'yearly']);
    Route::get('/reports/category-wise', [ReportController::class, 'categoryWise']);

    Route::apiResource('/ledgers', LedgerController::class)->only(['index', 'store', 'show', 'destroy']);
    Route::apiResource('/journals', JournalController::class)->only(['index', 'store', 'destroy']);
    Route::get('/accounting/trial-sheet', [AccountingReportController::class, 'trialSheet']);
    Route::get('/accounting/ledgers/{ledger}/statement', [AccountingReportController::class, 'ledgerStatement']);
    Route::post('/accounting/import', [AccountingReportController::class, 'importCsv']);
    Route::get('/accounting/export', [AccountingReportController::class, 'exportCsv']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
});

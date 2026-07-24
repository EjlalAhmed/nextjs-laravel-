<?php

return [
    'roles' => ['super_admin', 'admin', 'user'],

    'permissions' => [
        'super_admin' => [
            'manage_users',
            'manage_roles',
            'manage_transactions',
            'manage_categories',
            'manage_budgets',
            'manage_ledgers',
            'manage_journals',
            'view_reports',
            'manage_profile',
        ],
        'admin' => [
            'manage_users',
            'manage_transactions',
            'manage_categories',
            'manage_budgets',
            'manage_ledgers',
            'manage_journals',
            'view_reports',
            'manage_profile',
        ],
        'user' => [
            'manage_transactions',
            'manage_categories',
            'manage_budgets',
            'view_reports',
            'manage_profile',
        ],
    ],
];

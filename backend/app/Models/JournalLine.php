<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalLine extends Model
{
    use HasFactory;

    protected $fillable = ['journal_entry_id', 'ledger_id', 'type', 'amount'];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function entry()
    {
        return $this->belongsTo(JournalEntry::class, 'journal_entry_id');
    }

    public function ledger()
    {
        return $this->belongsTo(Ledger::class);
    }
}

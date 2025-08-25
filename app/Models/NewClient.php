<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewClient extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'newClients';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'cnpj',
        'json',
        'sintegra',
        'cnpjws',
        'receita',
        'simples_nacional',
        'origem',
        'status',
        'flag',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'json' => 'array',
        'sintegra' => 'array',
        'cnpjws' => 'array',
        'receita' => 'array',
        'simples_nacional' => 'array',
        'flag' => 'integer',
    ];

    /**
     * The model's default values for attributes.
     *
     * @var array
     */
    protected $attributes = [
        'status' => 'PEN',
        'flag' => 0,
    ];
}

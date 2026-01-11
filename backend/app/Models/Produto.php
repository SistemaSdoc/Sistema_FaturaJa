<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Produto extends TenantModel
{
    use HasFactory;

    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'nome',
        'descricao',
        'preco',
        'estoque',
        'tipo',
    ];

    /**
     * Gera UUID automaticamente
     */
    protected static function booted()
    {
        static::creating(function ($model) {
            if (! $model->id) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Relacionamento com tenant
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * 🔐 Escopo seguro por tenant
     */
    public function scopeDoTenant($query)
    {
        $tenant = app('tenant');

        if (! $tenant) {
            throw new \Exception('Tenant não resolvido ao consultar produtos');
        }

        return $query->where('tenant_id', $tenant->id);
    }
}

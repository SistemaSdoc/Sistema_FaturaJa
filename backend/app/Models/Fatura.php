<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Fatura extends TenantModel
{
    use HasFactory;

    protected $connection = 'tenant';
    protected $table = 'faturas';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'tenant_id',
        'nome_cliente',
        'cliente_id',
        'nif_cliente',
        'numero',
        'data_emissao',
        'data_vencimento',
        'valor_total',
        'status',
        'tipo'
    ];

    protected $casts = [
        'id' => 'string',
        'tenant_id' => 'string',
        'cliente_id' => 'string',
    ];

    // 🔗 Relação com Tenant
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
    public function scopeDoTenant($query)
{
    return $query->where('tenant_id', app('tenant')->id);
}

public function cliente()
{
    return $this->belongsTo(Cliente::class);
}

public function itens()
{
    return $this->hasMany(ItemFatura::class);
}

}

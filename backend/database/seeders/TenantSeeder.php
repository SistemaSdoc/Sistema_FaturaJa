<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use App\Models\Tenant;

class TenantSeeder extends Seeder
{
    public function run()
    {
        $databaseName = 'bai_bd';

        // 1️⃣ Criar base de dados do tenant
        DB::statement("
            CREATE DATABASE IF NOT EXISTS `$databaseName`
            CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        ");

        // 2️⃣ Criar tenant (landlord)
        $tenant = Tenant::create([
            'id' => Str::uuid(),
            'name' => 'BAI',
            'subdomain' => 'bai',
            'email' => 'bai@gmail.com',
            'nif' => '234568901',
            'database_name' => $databaseName,
        ]);

        // 3️⃣ Configurar conexão tenant
        config(['database.connections.tenant.database' => $databaseName]);
        DB::purge('tenant');
        DB::reconnect('tenant');

        // 4️⃣ Rodar migrations do tenant
        Artisan::call('migrate', [
            '--database' => 'tenant',
            '--path' => 'database/migrations/tenant',
            '--force' => true,
        ]);

        // 5️⃣ Clientes
        $clientes = [
            [
                'id' => Str::uuid(),
                'tenant_id' => $tenant->id,
                'nome' => 'Diniz Cabenda',
                'email' => 'diniz@gmail.com',
                'telefone' => '912345678',
                'nif' => '999999999',
                'tipo_cliente' => 'consumidor_final',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'tenant_id' => $tenant->id,
                'nome' => 'Paulina Capitao',
                'email' => 'paulina@gmail.com',
                'telefone' => '923456789',
                'nif' => '123456789',
                'tipo_cliente' => 'empresa',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::connection('tenant')->table('clientes')->insert($clientes);

        // 6️⃣ Produtos
        $produtos = [
            ['nome' => 'Camisa Social', 'descricao' => 'Camisa branca', 'preco' => 25.50],
            ['nome' => 'Calça Jeans', 'descricao' => 'Calça azul', 'preco' => 40.00],
            ['nome' => 'Tênis', 'descricao' => 'Tênis confortável', 'preco' => 60.00],
            ['nome' => 'Computador', 'descricao' => 'Alta performance', 'preco' => 3500.00],
        ];

        foreach ($produtos as $p) {
            DB::connection('tenant')->table('produtos')->insert([
                'id' => Str::uuid(),
                'tenant_id' => $tenant->id,
                'nome' => $p['nome'],
                'descricao' => $p['descricao'],
                'preco' => $p['preco'],
                'estoque' => rand(5, 20),
                'tipo' => 'produto',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 7️⃣ Faturas (com snapshot fiscal)
        $clientesDB = DB::connection('tenant')->table('clientes')->get()->keyBy('id');

        $faturas = [];
        foreach ($clientesDB as $cliente) {
            for ($i = 1; $i <= 3; $i++) {
                $faturas[] = [
                    'id' => Str::uuid(),
                    'tenant_id' => $tenant->id,
                    'cliente_id' => $cliente->id,
                    'nome_cliente' => $cliente->nome,
                    'nif_cliente' => $cliente->nif,
                    'numero' => 'FAT-' . rand(10000, 99999),
                    'data_emissao' => now()->subDays(rand(1, 20)),
                    'data_vencimento' => now()->addDays(rand(5, 15)),
                    'valor_total' => rand(100, 800),
                    'status' => ['pendente', 'pago', 'cancelado'][rand(0, 2)],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        DB::connection('tenant')->table('faturas')->insert($faturas);

        // 8️⃣ Pagamentos
        $metodos = ['boleto', 'pix', 'cartão'];

        $faturasPagas = DB::connection('tenant')
            ->table('faturas')
            ->where('status', 'pago')
            ->get();

        foreach ($faturasPagas as $fatura) {
            DB::connection('tenant')->table('pagamentos')->insert([
                'id' => Str::uuid(),
                'fatura_id' => $fatura->id,
                'tenant_id' => $tenant->id,
                'data_pagamento' => now(),
                'valor_pago' => $fatura->valor_total,
                'valor_troco' => 0,
                'valor_total_desconto' => 0,
                'status' => 'pago',
                'metodo_pagamento' => $metodos[array_rand($metodos)],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 9️⃣ Usuários
        DB::connection('tenant')->table('users')->insert([
            [
                'id' => Str::uuid(),
                'tenant_id' => $tenant->id,
                'name' => 'Vanio',
                'email' => 'vanioneto709@gmail.com',
                'password' => Hash::make('123456'),
                'role' => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'tenant_id' => $tenant->id,
                'name' => 'Paulina Capitao',
                'email' => 'capitaopaulinafernando@gmail.com',
                'password' => Hash::make('123456'),
                'role' => 'empresa',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

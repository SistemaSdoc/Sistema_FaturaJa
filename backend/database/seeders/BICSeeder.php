<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use App\Models\Tenant;

class BICSeeder extends Seeder
{
    public function run()
    {
        $databaseName = 'bic_bd';

        /** 1️⃣ Criar database do tenant */
        DB::statement("
            CREATE DATABASE IF NOT EXISTS `$databaseName`
            CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        ");

        /** 2️⃣ Criar tenant no landlord */
        $tenant = Tenant::create([
            'id' => (string) Str::uuid(),
            'name' => 'BIC',
            'subdomain' => 'bic',
            'nif' => '123456890',
            'email' => 'bic@gmail.com',
            'database_name' => $databaseName,
        ]);

        /** 3️⃣ Conectar no banco do tenant */
        config(['database.connections.tenant.database' => $databaseName]);
        DB::purge('tenant');
        DB::reconnect('tenant');

        /** 4️⃣ Rodar migrations do tenant */
        Artisan::call('migrate', [
            '--database' => 'tenant',
            '--path' => 'database/migrations/tenant',
            '--force' => true,
        ]);

        /** 5️⃣ Usuários */
        DB::connection('tenant')->table('users')->insert([
            [
                'id' => Str::uuid(),
                'name' => 'Stelvio Marques',
                'email' => 'stelviomarques157@gmail.com',
                'password' => Hash::make('123456'),
                'role' => 'admin',
                'tenant_id' => $tenant->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Alice Rocha',
                'email' => 'alicepaula507@gmail.com',
                'password' => Hash::make('123456'),
                'role' => 'empresa',
                'tenant_id' => $tenant->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        /** 6️⃣ Clientes */
        $clienteId = (string) Str::uuid();

        DB::connection('tenant')->table('clientes')->insert([
            'id' => $clienteId,
            'nome' => 'Gabriel Sobrio',
            'email' => 'gabrielsobrio@gmail.com',
            'telefone' => '912345678',
            'tipo_cliente'=>'consumidor_final',
            'tenant_id' => $tenant->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        /** 7️⃣ Produtos */
        $produtos = [
            ['nome' => 'Caneta', 'descricao' => 'Caneta azul', 'preco' => 1.50],
            ['nome' => 'Caderno', 'descricao' => 'Caderno capa dura', 'preco' => 12.00],
            ['nome' => 'Calça Social', 'descricao' => 'Calça branca', 'preco' => 25.50],
        ];

        foreach ($produtos as $p) {
            DB::connection('tenant')->table('produtos')->insert([
                'id' => Str::uuid(),
                'tenant_id' => $tenant->id,
                'nome' => $p['nome'],
                'descricao' => $p['descricao'],
                'preco' => $p['preco'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        /** 8️⃣ Faturas */
        $faturaIds = [];

        for ($i = 1; $i <= 3; $i++) {
            $id = (string) Str::uuid();
            $faturaIds[] = $id;

            DB::connection('tenant')->table('faturas')->insert([
                'id' => $id,
                'tenant_id' => $tenant->id,
                'cliente_id' => $clienteId,
                'nome_cliente' => 'Gabriel Sobrio',
                'nif_cliente' => '999999999',
                'numero' => 'FAT-' . rand(10000, 99999),
                'data_emissao' => now()->subDays(10 * $i),  
                
                'valor_total' => rand(50, 200),
                'status' => $i === 3 ? 'pago' : 'pendente',
                'data_vencimento' => now()->addDays(30),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        /** 9️⃣ Pagamentos */
        foreach ($faturaIds as $faturaId) {
            DB::connection('tenant')->table('pagamentos')->insert([
                'id' => Str::uuid(),
                'fatura_id' => $faturaId,
                'data_pagamento' => now(),
                'status' => 'pago',
                
                'valor_troco' => 0,
                'valor_total_desconto' => 0,
                'tenant_id' => $tenant->id,
                'valor_pago' => rand(30, 150),
                'metodo_pagamento' => 'pix',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('✅ Tenant BIC criado com dados completos para dashboard!');
    }
}

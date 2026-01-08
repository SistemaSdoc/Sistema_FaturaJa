<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class FaturaSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = DB::table('tenants')->first()->id;
      
    }
}

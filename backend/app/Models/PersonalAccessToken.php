<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    use HasFactory;

    protected $connection = 'tenant';
    protected $table = 'personal_access_tokens';

    public function tokenable()
    {
        return $this->morphTo();
    }
}

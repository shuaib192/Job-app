<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['applicant', 'employer', 'admin'])->default('applicant')->after('email');
            $table->string('phone')->nullable()->after('role');
            $table->string('location')->nullable()->after('phone');
            $table->string('avatar')->nullable()->after('location');
            $table->boolean('is_active')->default(true)->after('avatar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'location', 'avatar', 'is_active']);
        });
    }
};

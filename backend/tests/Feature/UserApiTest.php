<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_show_user_data(): void
    {
        $admin = User::factory()->admin()->create([
            'api_token' => hash('sha256', 'admin-token'),
        ]);

        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'created_by' => $admin->id,
        ]);

        $response = $this
            ->withHeader('Authorization', 'Bearer admin-token')
            ->getJson('/api/users/' . $user->id);

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.email', 'test@example.com');
    }

    public function test_regular_user_cannot_manage_users(): void
    {
        User::factory()->create([
            'api_token' => hash('sha256', 'user-token'),
        ]);

        $this
            ->withHeader('Authorization', 'Bearer user-token')
            ->getJson('/api/users')
            ->assertForbidden();
    }

    public function test_super_admin_can_change_user_role(): void
    {
        $superAdmin = User::factory()->superAdmin()->create([
            'api_token' => hash('sha256', 'super-token'),
        ]);

        $user = User::factory()->create([
            'created_by' => $superAdmin->id,
        ]);

        $this
            ->withHeader('Authorization', 'Bearer super-token')
            ->putJson('/api/users/' . $user->id, [
                'role' => User::ROLE_ADMIN,
            ])
            ->assertOk()
            ->assertJsonPath('data.role', User::ROLE_ADMIN);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'role' => User::ROLE_ADMIN,
        ]);
    }

    public function test_super_admin_can_create_admin_and_user(): void
    {
        $superAdmin = User::factory()->superAdmin()->create([
            'api_token' => hash('sha256', 'super-token'),
        ]);

        $this
            ->withHeader('Authorization', 'Bearer super-token')
            ->postJson('/api/users', [
                'name' => 'New Admin',
                'email' => 'admin@example.com',
                'password' => 'password123',
                'role' => User::ROLE_ADMIN,
            ])
            ->assertCreated()
            ->assertJsonPath('data.role', User::ROLE_ADMIN)
            ->assertJsonPath('data.created_by', $superAdmin->id);

        $this
            ->withHeader('Authorization', 'Bearer super-token')
            ->postJson('/api/users', [
                'name' => 'New User',
                'email' => 'user@example.com',
                'password' => 'password123',
                'role' => User::ROLE_USER,
            ])
            ->assertCreated()
            ->assertJsonPath('data.role', User::ROLE_USER)
            ->assertJsonPath('data.created_by', $superAdmin->id);
    }

    public function test_admin_can_create_only_user(): void
    {
        $admin = User::factory()->admin()->create([
            'api_token' => hash('sha256', 'admin-token'),
        ]);

        $this
            ->withHeader('Authorization', 'Bearer admin-token')
            ->postJson('/api/users', [
                'name' => 'Created User',
                'email' => 'created@example.com',
                'password' => 'password123',
                'role' => User::ROLE_USER,
            ])
            ->assertCreated()
            ->assertJsonPath('data.role', User::ROLE_USER)
            ->assertJsonPath('data.created_by', $admin->id);

        $this
            ->withHeader('Authorization', 'Bearer admin-token')
            ->postJson('/api/users', [
                'name' => 'Blocked Admin',
                'email' => 'blocked@example.com',
                'password' => 'password123',
                'role' => User::ROLE_ADMIN,
            ])
            ->assertForbidden();
    }

    public function test_admin_cannot_manage_user_created_by_someone_else(): void
    {
        User::factory()->admin()->create([
            'api_token' => hash('sha256', 'admin-token'),
        ]);

        $otherAdmin = User::factory()->admin()->create();
        $user = User::factory()->create([
            'created_by' => $otherAdmin->id,
        ]);

        $this
            ->withHeader('Authorization', 'Bearer admin-token')
            ->getJson('/api/users/' . $user->id)
            ->assertForbidden();
    }
}

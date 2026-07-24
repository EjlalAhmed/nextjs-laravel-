<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->with('createdBy:id,name,email,role')->latest();

        if (! $request->user()->isSuperAdmin()) {
            $query->where('created_by', $request->user()->id);
        }

        return response()->json([
            'data' => $query->get()->map(fn (User $user) => $this->formatUser($user)),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'min:6'],
            'role' => ['required', Rule::in(config('permissions.roles'))],
        ]);

        abort_unless(
            in_array($data['role'], $this->creatableRolesFor($request->user()), true),
            403,
            'You cannot create this role.',
        );

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'created_by' => $request->user()->id,
        ]);

        return response()->json(['data' => $this->formatUser($user->load('createdBy:id,name,email,role'))], 201);
    }

    public function show(Request $request, User $user)
    {
        $this->authorizeManagedUser($request->user(), $user);

        $user->load('createdBy:id,name,email,role');

        return response()->json(['data' => $this->formatUser($user)]);
    }

    public function update(Request $request, User $user)
    {
        $this->authorizeManagedUser($request->user(), $user);

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'unique:users,email,' . $user->id],
            'password' => ['nullable', 'min:6'],
            'role' => ['sometimes', 'required', Rule::in(config('permissions.roles'))],
        ]);

        if (array_key_exists('role', $data)) {
            abort_unless($request->user()->isSuperAdmin(), 403, 'Only super admin can change roles.');
            abort_unless(in_array($data['role'], $this->creatableRolesFor($request->user()), true), 403);
            $user->role = $data['role'];
        }

        if (array_key_exists('name', $data)) {
            $user->name = $data['name'];
        }

        if (array_key_exists('email', $data)) {
            $user->email = $data['email'];
        }

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return response()->json(['data' => $this->formatUser($user->load('createdBy:id,name,email,role'))]);
    }

    public function destroy(Request $request, User $user)
    {
        $this->authorizeManagedUser($request->user(), $user);

        abort_if($request->user()->id === $user->id, 422, 'You cannot delete your own account.');

        $user->delete();

        return response()->noContent();
    }

    public function permissions(Request $request)
    {
        return response()->json([
            'role' => $request->user()->role,
            'permissions' => $request->user()->permissions(),
            'roles' => config('permissions.roles'),
        ]);
    }

    /**
     * @return array<int, string>
     */
    private function creatableRolesFor(User $creator): array
    {
        if ($creator->isSuperAdmin()) {
            return [User::ROLE_ADMIN, User::ROLE_USER];
        }

        if ($creator->role === User::ROLE_ADMIN) {
            return [User::ROLE_USER];
        }

        return [];
    }

    private function authorizeManagedUser(User $actor, User $target): void
    {
        if ($actor->isSuperAdmin()) {
            abort_if($target->isSuperAdmin(), 403, 'Super admin accounts cannot be managed from this endpoint.');

            return;
        }

        abort_unless(
            $actor->role === User::ROLE_ADMIN
                && $target->role === User::ROLE_USER
                && $target->created_by === $actor->id,
            403,
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'created_by' => $user->created_by,
            'created_by_user' => $user->createdBy ? [
                'id' => $user->createdBy->id,
                'name' => $user->createdBy->name,
                'email' => $user->createdBy->email,
                'role' => $user->createdBy->role,
            ] : null,
        ];
    }
}

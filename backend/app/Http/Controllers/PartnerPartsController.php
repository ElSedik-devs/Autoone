<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\Part;
use App\Models\PartOrder;

class PartnerPartsController extends Controller
{
    // Helpers
    private function assertPartner(Request $r): void
    {
        $role = $r->user()?->role;
        if (!in_array($role, ['partner','admin'], true)) {
            abort(403, 'Partner only');
        }
    }
    private function pid(Request $r): int { return (int) $r->user()->id; }

    // GET /api/partner/parts
    public function index(Request $r)
    {
        $this->assertPartner($r);
        $pid = $this->pid($r);

        $q = Part::query()->where('owner_user_id', $pid);

        if ($r->filled('q')) {
            $term = (string) $r->input('q');
            $q->where(function ($qq) use ($term) {
                $qq->where('name','like',"%{$term}%")
                   ->orWhere('description','like',"%{$term}%");
            });
        }
        if ($r->filled('category')) {
            $q->where('category', (string) $r->input('category'));
        }
        // Use boolean() to read truthy/falsey correctly
        if ($r->has('active')) {
            $q->where('is_active', $r->boolean('active'));
        }

        return $q->orderByDesc('id')->paginate(20);
    }

    // POST /api/partner/parts
    public function store(Request $r)
    {
        $this->assertPartner($r);
        $pid = $this->pid($r);

        $data = $r->validate([
            'category'       => ['required', Rule::in(['tires','brakes','batteries','oils','accessories'])],
            'name'           => ['required','string','max:200'],
            'price'          => ['required','numeric','min:0'],
            'stock'          => ['required','integer','min:0'],
            'image_url'      => ['nullable','string','max:500'],
            'description'    => ['nullable','string'],
            'is_active'      => ['sometimes','boolean'],
            'compat'         => ['nullable','array'],
            'compat_models'  => ['nullable','array'],
            'vin_codes'      => ['nullable','array'],
        ]);

        $part = Part::create(array_merge($data, [
            'owner_user_id' => $pid,
            'is_active'     => (bool)($data['is_active'] ?? true),
        ]));

        return response()->json($part, 201);
    }

    // PATCH /api/partner/parts/{id}
    public function update(Request $r, int $id)
    {
        $this->assertPartner($r);
        $pid = $this->pid($r);

        $part = Part::where('id',$id)->where('owner_user_id',$pid)->firstOrFail();

        $data = $r->validate([
            'category'       => ['sometimes', Rule::in(['tires','brakes','batteries','oils','accessories'])],
            'name'           => ['sometimes','string','max:200'],
            'price'          => ['sometimes','numeric','min:0'],
            'stock'          => ['sometimes','integer','min:0'],
            'image_url'      => ['sometimes','nullable','string','max:500'],
            'description'    => ['sometimes','nullable','string'],
            'is_active'      => ['sometimes','boolean'],
            'compat'         => ['sometimes','nullable','array'],
            'compat_models'  => ['sometimes','nullable','array'],
            'vin_codes'      => ['sometimes','nullable','array'],
        ]);

        $part->fill($data)->save();
        return $part;
    }

    // DELETE /api/partner/parts/{id}
    public function destroy(Request $r, int $id)
    {
        $this->assertPartner($r);
        $pid = $this->pid($r);

        $part = Part::where('id',$id)->where('owner_user_id',$pid)->firstOrFail();
        $part->delete();

        return response()->noContent();
    }

    // PATCH /api/partner/parts/{id}/stock
    public function setStock(Request $r, int $id)
    {
        $this->assertPartner($r);
        $pid = $this->pid($r);

        $data = $r->validate(['stock' => ['required','integer','min:0']]);

        $part = Part::where('id',$id)->where('owner_user_id',$pid)->firstOrFail();
        $part->stock = (int) $data['stock'];
        $part->save();

        return $part;
    }

    // GET /api/partner/part-orders
    public function orders(Request $r)
    {
        $this->assertPartner($r);
        $pid = $this->pid($r);

        $items = PartOrder::with(['part:id,name,image_url,owner_user_id','user:id,name,email'])
            ->whereHas('part', fn($q) => $q->where('owner_user_id',$pid))
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($items);
    }

    // PATCH /api/partner/part-orders/{id}
    public function updateOrderStatus(Request $r, int $id)
    {
        $this->assertPartner($r);
        $pid = $this->pid($r);

        $data = $r->validate([
            'status' => ['required', Rule::in(['submitted','processing','completed','cancelled'])],
        ]);

        $order = PartOrder::where('id',$id)
            ->whereHas('part', fn($q)=>$q->where('owner_user_id',$pid))
            ->firstOrFail();

        $order->status = $data['status'];
        $order->save();

        return $order->load(['part:id,name,image_url,owner_user_id','user:id,name,email']);
    }
}

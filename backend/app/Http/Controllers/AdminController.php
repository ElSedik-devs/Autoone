<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Workshop;
use App\Models\Service;
use App\Models\Booking;

class AdminController extends Controller
{
    private function assertAdmin(Request $request): void
    {
        if ($request->user()?->role !== 'admin') {
            abort(403, 'Admin only');
        }
    }

    // GET /api/admin/kpis
    public function kpis(Request $request)
    {
        $this->assertAdmin($request);

        $users = User::count();
        $partners = User::where('role', 'partner')->count();
        $partnersPending = User::where('role','partner')->where('partner_status','pending')->count(); // added
        $workshops = Workshop::count();
        $services = Service::count();

        $totalBookings = Booking::count();
        $byStatus = Booking::selectRaw('status, COUNT(*) as c')
            ->groupBy('status')
            ->pluck('c', 'status');

        return response()->json([
            'users' => $users,
            'partners' => $partners,
            'partnersPending' => $partnersPending, // added
            'workshops' => $workshops,
            'services' => $services,
            'bookings' => [
                'total'     => $totalBookings,
                'pending'   => $byStatus['pending']   ?? 0,
                'confirmed' => $byStatus['confirmed'] ?? 0,
                'rejected'  => $byStatus['rejected']  ?? 0,
            ],
        ]);
    }

    // GET /api/admin/bookings
    public function bookings(Request $request)
    {
        $this->assertAdmin($request);

        return Booking::with(['user','service.workshop'])
            ->latest()
            ->limit(200) // simple cap for demo
            ->get();
    }

    // GET /api/admin/partners/pending
    public function pendingPartners(Request $request)
    {
        $this->assertAdmin($request);

        return User::where('role', 'partner')
            ->where('partner_status', 'pending')
            ->get(['id','name','email','business_type','company_name','phone','partner_status']);
    }

    // PATCH /api/admin/partners/{user}/approve
    public function approvePartner(Request $request, User $user)
    {
        $this->assertAdmin($request);

        if ($user->role !== 'partner') {
            return response()->json(['message'=>'Not a partner'], 400);
        }

        $user->partner_status = 'approved';
        $user->save();

        return response()->json(['message'=>'Partner approved','user'=>$user]);
    }

    // PATCH /api/admin/partners/{user}/reject
    public function rejectPartner(Request $request, User $user)
    {
        $this->assertAdmin($request);

        if ($user->role !== 'partner') {
            return response()->json(['message'=>'Not a partner'], 400);
        }

        $user->partner_status = 'rejected';
        $user->save();

        return response()->json(['message'=>'Partner rejected','user'=>$user]);
    }
}

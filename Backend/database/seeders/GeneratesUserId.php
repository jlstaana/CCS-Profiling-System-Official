<?php

namespace Database\Seeders;

use App\Models\User;

/**
 * Shared trait for generating clean, collision-safe user IDs
 * across all seeders.
 *
 * Format:  PREFIX-YEAR-NNNN
 *   Admin   → A-2024-0001
 *   Faculty → F-2024-0023
 *   Student → S-2024-3847  (randomised range for an irregular look)
 */
trait GeneratesUserId
{
    /** Already-issued IDs this seeding session (prevents duplicates). */
    private array $_issuedIds = [];

    /**
     * Generate and return a unique user_id.
     *
     * @param  string  $role   student | faculty | admin
     * @param  int     $year   admission year (defaults to current year)
     * @param  bool    $random Use a random 4-digit number (irregular look for students)
     */
    private function genUserId(string $role, int $year = 0, bool $random = false): string
    {
        if ($year === 0) $year = (int) date('Y');

        $prefix = match ($role) {
            'student' => 'S',
            'faculty' => 'F',
            'admin'   => 'A',
            default   => 'U',
        };

        // Pull already-used IDs from DB once (lazy load)
        if (empty($this->_issuedIds)) {
            $this->_issuedIds = User::whereNotNull('user_id')
                ->pluck('user_id')
                ->toArray();
        }

        do {
            if ($random) {
                // Random 4-digit number (irregular look, varied year 2020-2024)
                $yr  = rand(2020, 2024);
                $num = str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
            } else {
                // Sequential within this seeding session
                $yr = $year;
                $existing = array_filter($this->_issuedIds, fn($id) => str_starts_with($id, "{$prefix}-{$yr}-"));
                $seq = count($existing) + 1;
                
                // Ensure we don't collide if there are gaps in existing IDs
                do {
                    $num = str_pad($seq, 4, '0', STR_PAD_LEFT);
                    $id = "{$prefix}-{$yr}-{$num}";
                    $seq++;
                } while (in_array($id, $this->_issuedIds, true));
                
                return $this->finalizeId($id);
            }
            $id = "{$prefix}-{$yr}-{$num}";
        } while (in_array($id, $this->_issuedIds, true));

        return $this->finalizeId($id);
    }

    /** Helper to record and return the ID */
    private function finalizeId(string $id): string
    {
        $this->_issuedIds[] = $id;
        return $id;
    }

    /**
     * Assign a user_id to any existing user that is missing one.
     */
    private function backfillUserIds(): void
    {
        $missing = User::whereNull('user_id')->get();
        foreach ($missing as $u) {
            $u->user_id = $this->genUserId($u->role ?? 'student', (int) date('Y', strtotime($u->created_at)));
            $u->save();
        }
    }
}

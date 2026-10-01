$ErrorActionPreference = "Continue"

$baseUrl = "http://localhost:8080"
$passed = 0
$failed = 0

function Assert-Status {
    param(
        [string]$testName,
        [int]$expectedStatus,
        [int]$actualStatus,
        [string]$body = ""
    )
    if ($actualStatus -eq $expectedStatus) {
        Write-Host " [PASS] $testName (Status: $actualStatus)" -ForegroundColor Green
        $script:passed++
        return $true
    } else {
        Write-Host " [FAIL] $testName (Expected: $expectedStatus, Got: $actualStatus)" -ForegroundColor Red
        if ($body) {
            Write-Host "        Response: $body" -ForegroundColor Yellow
        }
        $script:failed++
        return $false
    }
}

function Invoke-Api {
    param(
        [string]$method,
        [string]$endpoint,
        [string]$token = $null,
        $body = $null
    )
    $headers = @{}
    if ($token) {
        $headers["Authorization"] = "Bearer $token"
    }
    if ($body) {
        $headers["Content-Type"] = "application/json"
        $jsonBody = if ($body -is [string]) { $body } else { $body | ConvertTo-Json -Compress }
    }

    try {
        if ($body) {
            $resp = Invoke-WebRequest -Uri "$baseUrl$endpoint" -Method $method -Headers $headers -Body $jsonBody -UseBasicParsing -TimeoutSec 10
        } else {
            $resp = Invoke-WebRequest -Uri "$baseUrl$endpoint" -Method $method -Headers $headers -UseBasicParsing -TimeoutSec 10
        }
        return @{
            Status = [int]$resp.StatusCode
            Body = $resp.Content
            Headers = $resp.Headers
        }
    } catch [System.Net.WebException] {
        $res = $_.Exception.Response
        if ($res) {
            $stream = $res.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $content = $reader.ReadToEnd()
            return @{
                Status = [int]$res.StatusCode
                Body = $content
                Headers = $res.Headers
            }
        }
        return @{
            Status = 0
            Body = $_.Exception.Message
            Headers = @{}
        }
    } catch {
        return @{
            Status = 0
            Body = $_.Exception.Message
            Headers = @{}
        }
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         NILEV SECURITY & IDOR AUDIT VERIFICATION         " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# ── 1. Authentication & JWT Validation ─────────────────────────────
Write-Host "`n--- 1. Authentication & JWT Token Validation ---" -ForegroundColor Yellow

# 1.1 Unauthenticated access
$res = Invoke-Api -method "GET" -endpoint "/api/habits"
Assert-Status -testName "Reject unauthenticated request to /api/habits" -expectedStatus 401 -actualStatus $res.Status -body $res.Body

# 1.2 Invalid JWT token
$res = Invoke-Api -method "GET" -endpoint "/api/habits" -token "eyJhbGciOiJIUzI1NiJ9.invalid.fake"
Assert-Status -testName "Reject malformed/forged JWT token" -expectedStatus 401 -actualStatus $res.Status -body $res.Body

# 1.3 Alex Login
$loginAlex = @{ email = "alex@nilev.com"; password = "Password123!" }
$resAlex = Invoke-Api -method "POST" -endpoint "/api/auth/login" -body $loginAlex
Assert-Status -testName "Authenticate valid user (Alex)" -expectedStatus 200 -actualStatus $resAlex.Status
$alexAuth = $resAlex.Body | ConvertFrom-Json
$alexToken = $alexAuth.data.accessToken
$alexRefreshToken = $alexAuth.data.refreshToken
$alexId = $alexAuth.data.user.id

# 1.4 Maya Login
$loginMaya = @{ email = "maya@nilev.com"; password = "Password123!" }
$resMaya = Invoke-Api -method "POST" -endpoint "/api/auth/login" -body $loginMaya
Assert-Status -testName "Authenticate valid user (Maya)" -expectedStatus 200 -actualStatus $resMaya.Status
$mayaAuth = $resMaya.Body | ConvertFrom-Json
$mayaToken = $mayaAuth.data.accessToken
$mayaId = $mayaAuth.data.user.id

# 1.5 Register Stranger (Unbonded third-party)
$strangerEmail = "stranger_audit_" + (Get-Random) + "@nilev.com"
$regStranger = @{ name = "Audit Stranger"; email = $strangerEmail; password = "Password123!" }
$resStranger = Invoke-Api -method "POST" -endpoint "/api/auth/register" -body $regStranger
Assert-Status -testName "Register unbonded outsider" -expectedStatus 201 -actualStatus $resStranger.Status
$strangerAuth = $resStranger.Body | ConvertFrom-Json
$strangerToken = $strangerAuth.data.accessToken
$strangerId = $strangerAuth.data.user.id

# 1.6 Refresh token cannot be used directly on API
$resRefreshMisuse = Invoke-Api -method "GET" -endpoint "/api/habits" -token $alexRefreshToken
Assert-Status -testName "Reject REFRESH token when used as API bearer token" -expectedStatus 401 -actualStatus $resRefreshMisuse.Status -body $resRefreshMisuse.Body

# ── 2. Habit Ownership & IDOR Protection ──────────────────────────
Write-Host "`n--- 2. Habit Ownership & IDOR Defense (Critical Rule) ---" -ForegroundColor Yellow

# Get Alex's habits
$alexHabitsRes = Invoke-Api -method "GET" -endpoint "/api/habits" -token $alexToken
$alexHabits = ($alexHabitsRes.Body | ConvertFrom-Json).data
$alexHabitId = $alexHabits[0].id

# Get Maya's habits
$mayaHabitsRes = Invoke-Api -method "GET" -endpoint "/api/habits" -token $mayaToken
$mayaHabits = ($mayaHabitsRes.Body | ConvertFrom-Json).data
$mayaHabitId = $mayaHabits[0].id

Write-Host "  -> Alex Habit ID: $alexHabitId | Maya Habit ID: $mayaHabitId" -ForegroundColor DarkGray

# 2.1 Alex accesses Maya's habit via ID in URL
$res = Invoke-Api -method "GET" -endpoint "/api/habits/$mayaHabitId" -token $alexToken
Assert-Status -testName "GET /api/habits/{partnerHabitId} by Alex -> 403 Forbidden" -expectedStatus 403 -actualStatus $res.Status -body $res.Body

# 2.2 Alex attempts PUT on Maya's habit
$updateBody = @{ name = "Hacked Habit Name" }
$res = Invoke-Api -method "PUT" -endpoint "/api/habits/$mayaHabitId" -token $alexToken -body $updateBody
Assert-Status -testName "PUT /api/habits/{partnerHabitId} by Alex -> 403 Forbidden" -expectedStatus 403 -actualStatus $res.Status -body $res.Body

# 2.3 Alex attempts DELETE on Maya's habit
$res = Invoke-Api -method "DELETE" -endpoint "/api/habits/$mayaHabitId" -token $alexToken
Assert-Status -testName "DELETE /api/habits/{partnerHabitId} by Alex -> 403 Forbidden" -expectedStatus 403 -actualStatus $res.Status -body $res.Body

# 2.4 Alex attempts to complete Maya's habit
$res = Invoke-Api -method "POST" -endpoint "/api/habits/$mayaHabitId/complete" -token $alexToken
Assert-Status -testName "POST /api/habits/{partnerHabitId}/complete by Alex -> 403 Forbidden" -expectedStatus 403 -actualStatus $res.Status -body $res.Body

# 2.5 Stranger attempts to access Alex's habit
$res = Invoke-Api -method "GET" -endpoint "/api/habits/$alexHabitId" -token $strangerToken
Assert-Status -testName "GET /api/habits/{alexHabitId} by Stranger -> 403 Forbidden" -expectedStatus 403 -actualStatus $res.Status -body $res.Body

# 2.6 Alex accesses their own habit
$res = Invoke-Api -method "GET" -endpoint "/api/habits/$alexHabitId" -token $alexToken
Assert-Status -testName "GET /api/habits/{alexHabitId} by Alex (Owner) -> 200 OK" -expectedStatus 200 -actualStatus $res.Status

# ── 3. User Profile Privacy & IDOR Checks ─────────────────────────
Write-Host "`n--- 3. User Profile Privacy & IDOR Restrictions ---" -ForegroundColor Yellow

# 3.1 Stranger attempts to query Alex's profile by ID
$res = Invoke-Api -method "GET" -endpoint "/api/v1/users/$alexId" -token $strangerToken
Assert-Status -testName "GET /api/v1/users/{alexId} by Stranger -> 403 Forbidden" -expectedStatus 403 -actualStatus $res.Status -body $res.Body

# 3.2 Alex queries own profile
$res = Invoke-Api -method "GET" -endpoint "/api/v1/users/$alexId" -token $alexToken
Assert-Status -testName "GET /api/v1/users/{alexId} by Alex (Self) -> 200 OK" -expectedStatus 200 -actualStatus $res.Status

# 3.3 Alex queries connected partner Maya's profile
$res = Invoke-Api -method "GET" -endpoint "/api/v1/users/$mayaId" -token $alexToken
Assert-Status -testName "GET /api/v1/users/{mayaId} by Alex (Connected Partner) -> 200 OK" -expectedStatus 200 -actualStatus $res.Status

# 3.4 Alex queries Stranger's profile
$res = Invoke-Api -method "GET" -endpoint "/api/v1/users/$strangerId" -token $alexToken
Assert-Status -testName "GET /api/v1/users/{strangerId} by Alex (Unconnected) -> 403 Forbidden" -expectedStatus 403 -actualStatus $res.Status -body $res.Body

# ── 4. Notification Ownership Checks ──────────────────────────────
Write-Host "`n--- 4. Notification Ownership & IDOR Protection ---" -ForegroundColor Yellow

$alexNotifRes = Invoke-Api -method "GET" -endpoint "/api/notifications" -token $alexToken
$alexNotifs = ($alexNotifRes.Body | ConvertFrom-Json).data.notifications
if ($alexNotifs.Count -gt 0) {
    $notifId = $alexNotifs[0].id
    # Stranger attempts to mark Alex's notification as read
    $res = Invoke-Api -method "PATCH" -endpoint "/api/notifications/$notifId/read" -token $strangerToken
    Assert-Status -testName "PATCH /api/notifications/{alexNotifId}/read by Stranger -> 403 Forbidden" -expectedStatus 403 -actualStatus $res.Status -body $res.Body

    # Alex marks their own notification
    $res = Invoke-Api -method "PATCH" -endpoint "/api/notifications/$notifId/read" -token $alexToken
    Assert-Status -testName "PATCH /api/notifications/{alexNotifId}/read by Alex (Owner) -> 200 OK" -expectedStatus 200 -actualStatus $res.Status
} else {
    Write-Host "  -> Skipping individual notification test (no Alex notifications found)" -ForegroundColor DarkGray
}

# ── 5. Goal Modification & Partner Contribution Rules ─────────────
Write-Host "`n--- 5. Goals Authorization & Personal Goal Protection ---" -ForegroundColor Yellow

# Create a Maya personal goal
$createGoalBody = @{
    title = "Maya's Private Journey"
    type = "PERSONAL"
    targetValue = 30.0
    currentValue = 5.0
    unit = "days"
}
$mayaGoalCreateRes = Invoke-Api -method "POST" -endpoint "/api/goals" -token $mayaToken -body $createGoalBody
$mayaPersonalGoalId = ($mayaGoalCreateRes.Body | ConvertFrom-Json).data.id

# 5.1 Alex attempts to modify Maya's personal goal (Rule: Do not allow one user to modify the other's personal goals)
$progressBody = @{ increment = 10.0 }
$res = Invoke-Api -method "PATCH" -endpoint "/api/goals/$mayaPersonalGoalId/progress" -token $alexToken -body $progressBody
Assert-Status -testName "PATCH /api/goals/{mayaPersonalGoalId}/progress by Alex -> 403 Forbidden" -expectedStatus 403 -actualStatus $res.Status -body $res.Body

# 5.2 Stranger attempts to read Maya's personal goal
$res = Invoke-Api -method "GET" -endpoint "/api/goals/$mayaPersonalGoalId" -token $strangerToken
Assert-Status -testName "GET /api/goals/{mayaPersonalGoalId} by Stranger -> 403 Forbidden" -expectedStatus 403 -actualStatus $res.Status -body $res.Body

# ── 6. Surprise System Security & Unsealing Rules ─────────────────
Write-Host "`n--- 6. Surprise System Access & Receiver-Only Unseal ---" -ForegroundColor Yellow

$alexSentSurprises = Invoke-Api -method "GET" -endpoint "/api/surprises/sent" -token $alexToken
$sentList = ($alexSentSurprises.Body | ConvertFrom-Json).data
if ($sentList.Count -gt 0) {
    $surpriseId = $sentList[0].id

    # Sender (Alex) cannot unseal their own surprise (only receiver Maya can)
    $res = Invoke-Api -method "POST" -endpoint "/api/surprises/$surpriseId/open" -token $alexToken
    Assert-Status -testName "POST /api/surprises/{id}/open by Alex (Sender) -> 403 Forbidden" -expectedStatus 403 -actualStatus $res.Status -body $res.Body

    # Stranger cannot view surprise
    $res = Invoke-Api -method "GET" -endpoint "/api/surprises/$surpriseId" -token $strangerToken
    Assert-Status -testName "GET /api/surprises/{id} by Stranger -> 403 Forbidden" -expectedStatus 403 -actualStatus $res.Status -body $res.Body
}

# ── 7. Activity Reactions Protection ──────────────────────────────
Write-Host "`n--- 7. Activity Feed Reactions Access Control ---" -ForegroundColor Yellow

$feedRes = Invoke-Api -method "GET" -endpoint "/api/activity" -token $alexToken
$activities = ($feedRes.Body | ConvertFrom-Json).data
if ($activities.Count -gt 0) {
    $actId = $activities[0].id

    # Stranger attempts to react to couple's activity
    $res = Invoke-Api -method "POST" -endpoint "/api/activity/$actId/react/%E2%9D%A4%EF%B8%8F" -token $strangerToken
    Assert-Status -testName "POST /api/activity/{id}/react by Stranger -> 403 Forbidden" -expectedStatus 403 -actualStatus $res.Status -body $res.Body

    # Alex reacts to activity
    $res = Invoke-Api -method "POST" -endpoint "/api/activity/$actId/react/%E2%9D%A4%EF%B8%8F" -token $alexToken
    Assert-Status -testName "POST /api/activity/{id}/react by Alex (Participant) -> 200 OK" -expectedStatus 200 -actualStatus $res.Status
}

# ── 8. DTO Validation & Input Sanitization ────────────────────────
Write-Host "`n--- 8. DTO Validation & Error Response Envelope ---" -ForegroundColor Yellow

# Blank habit name
$badHabit = @{ name = "" }
$res = Invoke-Api -method "POST" -endpoint "/api/habits" -token $alexToken -body $badHabit
Assert-Status -testName "DTO Validation: Blank habit name returns 400" -expectedStatus 400 -actualStatus $res.Status
$bodyObj = $res.Body | ConvertFrom-Json
if ($bodyObj.errorCode -eq "VALIDATION_FAILED" -and $bodyObj.errors.Count -gt 0) {
    Write-Host " [PASS] Error response contains VALIDATION_FAILED and field errors array" -ForegroundColor Green
    $script:passed++
} else {
    Write-Host " [FAIL] Expected VALIDATION_FAILED error envelope" -ForegroundColor Red
    $script:failed++
}

# ── 9. Sensitive Data Exposure ────────────────────────────────────
Write-Host "`n--- 9. Sensitive Data Exposure Audit ---" -ForegroundColor Yellow

$meRes = Invoke-Api -method "GET" -endpoint "/api/auth/me" -token $alexToken
$meData = $meRes.Body
if ($meData -match "passwordHash" -or $meData -match "Password123") {
    Write-Host " [FAIL] Sensitive password hash detected in /api/auth/me response!" -ForegroundColor Red
    $script:failed++
} else {
    Write-Host " [PASS] Password hash is NOT exposed in User/Auth responses" -ForegroundColor Green
    $script:passed++
}

# ── 10. Rate Limiting Headers & Threshold Enforcement ──────────────
Write-Host "`n--- 10. Rate Limiting Strategy Verification ---" -ForegroundColor Yellow

$loginReq = @{ email = "alex@nilev.com"; password = "Password123!" }
$resLimit = Invoke-Api -method "POST" -endpoint "/api/auth/login" -body $loginReq
if ($resLimit.Headers["X-RateLimit-Limit"] -ne $null) {
    Write-Host " [PASS] Rate limiting header X-RateLimit-Limit present: $($resLimit.Headers['X-RateLimit-Limit'])" -ForegroundColor Green
    $script:passed++
} else {
    Write-Host " [FAIL] Missing X-RateLimit-Limit header" -ForegroundColor Red
    $script:failed++
}

# Rapidly fire requests to verify 429 Too Many Requests enforcement
$hit429 = $false
for ($i = 1; $i -le 25; $i++) {
    $burst = Invoke-Api -method "POST" -endpoint "/api/auth/login" -body @{ email = "attacker@bad.com"; password = "wrong" }
    if ($burst.Status -eq 429) {
        $hit429 = $true
        break
    }
}
if ($hit429) {
    Write-Host " [PASS] Rate limit enforced HTTP 429 Too Many Requests on burst attempts" -ForegroundColor Green
    $script:passed++
} else {
    Write-Host " [FAIL] Rate limit did not trigger HTTP 429 on rapid burst" -ForegroundColor Red
    $script:failed++
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "                  SECURITY AUDIT SUMMARY                  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Total Tests Passed: $passed" -ForegroundColor Green
Write-Host " Total Tests Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "==========================================================" -ForegroundColor Cyan

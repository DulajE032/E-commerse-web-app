# Bank Transfer Verification & COD Payment Workflow — Implementation Plan

## Problem Statement

The current system has the basic scaffolding for Bank Transfer and COD payments, but lacks:
- A clear **Payment Status** lifecycle separate from Order Status
- **Amount mismatch detection** when admin verifies slips
- **Duplicate payment reference** prevention beyond DB constraints
- **COD payment confirmation** on delivery (payment stays `PENDING` forever)
- A polished **admin verification panel** showing expected vs transferred amounts
- Clear **customer-facing payment status tracking** on the Dashboard

---

## User Review Required

> [!IMPORTANT]
> **Currency Symbol**: The codebase currently uses `$` (USD). Your bank details reference Colombo, Sri Lanka. Should I switch to `Rs.` / `LKR` across the UI?

> [!IMPORTANT]
> **Amount Mismatch Behavior**: When admin finds a mismatch (e.g., expected Rs. 5,500 but slip shows Rs. 3,500), should the system:
> - **Option A**: Only allow `REJECT` (customer must re-pay full amount and re-upload)
> - **Option B**: Allow a `NEEDS_REVIEW` state where admin can add notes and the customer can respond
> - I'll implement **Option A** for now (simpler). Let me know if you want Option B.

---

## Status Architecture

### Payment Status (on `Payment` model)
```
PENDING → SUBMITTED → VERIFIED ✅
                    → REJECTED ❌ → (customer re-uploads) → SUBMITTED → ...
```

| Status | Meaning |
|--------|---------|
| `PENDING` | Payment record created, no action from customer yet |
| `SUBMITTED` | Customer uploaded bank slip (or COD order is delivered) |
| `VERIFIED` | Admin verified the bank transfer matches. COD: auto-set on delivery |
| `REJECTED` | Admin rejected the slip (amount mismatch, invalid slip, etc.) |

### Order Status (on `Order` model)
```
PENDING_VERIFICATION → SLIP_UPLOADED → CONFIRMED → SHIPPED → DELIVERED
                                     → PAYMENT_REJECTED → (re-upload) → SLIP_UPLOADED → ...
COD: CONFIRMED → SHIPPED → DELIVERED
```

### How They Interact

| Scenario | Order Status | Payment Status |
|----------|-------------|----------------|
| Bank Transfer placed | `pending_verification` | `PENDING` |
| Slip uploaded | `slip_uploaded` | `SUBMITTED` |
| Admin approves | `confirmed` | `VERIFIED` |
| Admin rejects | `payment_rejected` | `REJECTED` |
| Customer re-uploads after rejection | `slip_uploaded` | `SUBMITTED` |
| COD order placed | `confirmed` | `PENDING` |
| COD order delivered | `delivered` | `VERIFIED` |
| COD order shipped | `shipped` | `PENDING` |
| Order cancelled | `cancelled` | `REJECTED` |

---

## Proposed Changes

### Backend: Payment Model Enhancement

#### [MODIFY] [payment.py](file:///d:/clone/em/backend/app/models/payment.py)

Add fields to support admin verification workflow:
- `admin_notes` (TEXT, nullable) — admin can leave notes like "Amount mismatch: expected 5500, got 3500"
- `verified_by` (INTEGER FK users.id, nullable) — which admin verified/rejected

```diff
+ admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
+ verified_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
```

---

### Backend: Order Status Updates

#### [MODIFY] [order.py (endpoints)](file:///d:/clone/em/backend/app/api/v1/endpoints/order.py)

**1. Enhance `verify_payment` endpoint** — Admin verification with amount mismatch detection:
- Accept `admin_notes` field in request body
- Compare `order.total_amount` with `payment.amount` (both should match since amount is server-set, but admin can note discrepancies found on the actual bank slip)
- Store `verified_by` admin user ID
- Send email notification to customer on verify/reject

**2. Enhance `update_order_status` endpoint** — Auto-set COD payment to `VERIFIED` on delivery:
- When admin marks order status as `delivered` AND payment method is `cod`:
  - Auto-set `payment.status = "VERIFIED"` 
  - Auto-set `order.payment_status = "paid"`
  - Set `payment.verified_at = now()`

**3. Allow re-upload after rejection** — Modify `upload_bank_slip`:
- Currently blocks if status is `confirmed` or `cancelled`
- Also allow re-upload when status is `payment_rejected` (reset to `slip_uploaded`)

**4. Add `admin_notes` to the verify payment request schema**

---

### Backend: Schema Updates

#### [MODIFY] [order.py (schemas)](file:///d:/clone/em/backend/app/schemas/order.py)

- Update `VerifyPaymentRequest` to include optional `admin_notes: str`

#### [MODIFY] [payment.py (schemas)](file:///d:/clone/em/backend/app/schemas/payment.py)

- Add `admin_notes` and `verified_by` to `PaymentResponse`

---

### Backend: Email Notifications

#### [MODIFY] [email_service.py](file:///d:/clone/em/backend/app/services/email_service.py)

Add two new email functions:
- `send_payment_verified_email(customer_email, order_id, total_amount)` — sent when admin approves
- `send_payment_rejected_email(customer_email, order_id, reason)` — sent when admin rejects, explaining what to do next

---

### Frontend: Admin Orders Panel Enhancement

#### [MODIFY] [Orders.jsx (admin)](file:///d:/clone/em/frontend/src/admin/views/Orders.jsx)

This is the **most significant frontend change**. Transform the verify payment actions into a proper verification panel:

**Current state**: Simple ✓/✗ buttons inline with the table row.

**New state**: When admin clicks "Review Payment" on a bank transfer order:
1. **Expandable detail row** or **modal** appears showing:
   - **Expected Amount**: `order.total_amount` (server-calculated, tamper-proof)
   - **Payment Reference**: `order.bank_reference`
   - **Bank Slip**: Clickable image/PDF preview
   - **Payment Status Badge**: Current status
   - **Admin Notes Input**: Textarea for admin to add notes
   - **Action Buttons**: `✓ Approve Payment` / `✗ Reject Payment`
2. On rejection, require admin to enter notes (reason for rejection)
3. Visual indicators:
   - 🟡 `slip_uploaded` / `pending_verification` → "Needs Review" badge
   - 🟢 `confirmed` + `VERIFIED` → "Payment Verified" badge  
   - 🔴 `payment_rejected` + `REJECTED` → "Payment Rejected" badge

**Amount mismatch display** (admin sees):
```
Expected Amount:   Rs. 5,500.00
Status:            ⚠️ Awaiting Verification
Admin Notes:       [textarea]
```

---

### Frontend: Customer Dashboard Payment Status

#### [MODIFY] [Dashboard.jsx](file:///d:/clone/em/frontend/src/views/Dashboard.jsx)

Enhance the existing order card to show clear payment status to the customer:

1. **Payment Status Badge** — alongside the order status badge:
   - `PENDING` → ⏳ "Payment Pending" (amber)
   - `SUBMITTED` → 📤 "Slip Under Review" (blue)
   - `VERIFIED` → ✅ "Payment Verified" (green)
   - `REJECTED` → ❌ "Payment Rejected — Please re-upload" (red)

2. **Bank Transfer timeline** — replace/augment the generic order timeline for bank transfer orders:
   ```
   Placed → Slip Uploaded → Verified → Shipped → Delivered
   ```

3. **Re-upload prompt on rejection** — when payment is `REJECTED`:
   - Show admin's rejection notes/reason
   - Prominent "Re-upload Payment Slip" button
   - Clear instructions

4. **COD payment indicator** — for COD orders:
   - Show "Pay on Delivery" badge
   - After delivery: "Payment Collected ✅"

---

### Frontend: API Updates

#### [MODIFY] [api.js](file:///d:/clone/em/frontend/src/services/api.js)

- Update `verifyPayment` to accept `admin_notes` parameter:
```js
verifyPayment: async (orderId, isApproved, adminNotes, token) => {
  return request(`${API_BASE}/orders/${orderId}/verify-payment`, {
    method: 'PATCH',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }, token),
    body: JSON.stringify({ is_approved: isApproved, admin_notes: adminNotes }),
  });
},
```

---

## Duplicate Payment Prevention

Already handled by:
- `reference_number` column in `Payment` has `unique=True` constraint
- `bank_reference` column in `Order` has `unique=True` constraint  
- `generate_bank_reference()` checks for existing references before returning
- UUID fallback if 10 collision attempts fail

**No additional changes needed** — the existing architecture already prevents duplicates.

---

## Amount Tamper Prevention

Already handled by:
- Server calculates `total` from DB product prices (lines 100-122 in `order.py`)
- Frontend-sent `price` is ignored; `unit_price` is fetched from `product.price` / `product.discount_price`
- `payment.amount` is set to the server-computed total, not user input

**No additional changes needed** — the amount is always server-authoritative.

---

## Verification Plan

### Automated Tests
```bash
cd d:\clone\em\backend
python -m pytest tests/ -v
```

### Manual Verification
1. **Bank Transfer Flow**: 
   - Place order with Bank Transfer → verify reference generated
   - Upload slip from Dashboard → verify status changes to `slip_uploaded`
   - Admin approves → verify status changes to `confirmed` + `VERIFIED`
   - Admin rejects → verify status changes to `payment_rejected` + `REJECTED`
   - Customer re-uploads → verify cycle restarts

2. **COD Flow**:
   - Place COD order → verify `confirmed` + `PENDING`
   - Admin marks delivered → verify payment auto-set to `VERIFIED`

3. **Edge Cases**:
   - Try placing order with 0 stock → should fail
   - Try cancelling after 2 hours → should fail
   - Verify duplicate references never occur (stress test reference generator)

---

## Step-by-Step Task List

### Phase 1: Backend Enhancements
- [x] Add `admin_notes`, `verified_by` to `Payment` model
- [x] Update `PaymentResponse` schema with new fields
- [x] Update `VerifyPaymentRequest` schema to accept `admin_notes`
- [x] Enhance `verify_payment` endpoint (store admin notes, verified_by)
- [x] Add COD auto-verification logic in `update_order_status` (on delivery)
- [x] Allow re-upload after rejection in `upload_bank_slip`
- [x] Add `send_payment_verified_email` and `send_payment_rejected_email`
- [x] Generate and run Alembic migration

### Phase 2: Admin Frontend
- [x] Enhance admin Orders table with payment verification panel
- [x] Add amount display, slip preview, admin notes textarea
- [x] Add approve/reject with required notes on rejection
- [x] Update `api.js` to pass `admin_notes`

### Phase 3: Customer Frontend
- [x] Add payment status badge to Dashboard order cards
- [x] Show rejection reason and re-upload prompt
- [x] Add bank transfer-specific timeline
- [x] Add COD payment indicator

### Phase 4: Testing
- [x] Test full Bank Transfer lifecycle
- [x] Test full COD lifecycle
- [x] Test rejection → re-upload → approval flow
- [x] Test email notifications
- [x] Verify all status transitions

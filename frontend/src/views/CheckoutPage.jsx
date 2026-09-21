"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiHome,
  FiLock,
  FiTruck,
  FiCopy,
  FiCheck,
  FiUploadCloud,
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";
import { api } from "../services/api";
import { useAuth } from "../services/AuthContext";
import { useCart } from "../services/CartContext";

const CheckoutPage = () => {
  const router = useRouter();
  const { token } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" or "bank_transfer"
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [orderResult, setOrderResult] = useState(null); // { id, bank_reference, total_amount, payment_method }
  const [copiedRef, setCopiedRef] = useState(false);

  // For immediate slip upload on success screen
  const [slipFile, setSlipFile] = useState(null);
  const [isUploadingSlip, setIsUploadingSlip] = useState(false);
  const [slipUploadSuccess, setSlipUploadSuccess] = useState(false);
  const [slipUploadError, setSlipUploadError] = useState("");

  const shipping = useMemo(() => (cartTotal > 0 ? 15 : 0), [cartTotal]);
  const tax = 0;
  const total = cartTotal + shipping + tax;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (!token) {
      setError("Please log in to place an order.");
      return;
    }

    if (!cartItems.length) {
      setError("Your cart is empty.");
      return;
    }

    setIsProcessing(true);
    setError("");

    const orderData = {
      email: formData.email,
      phone: formData.phone,
      payment_method: paymentMethod,
      shipping_address: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
      },
      items: cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      })),
      shipping_cost: shipping,
      tax_amount: tax,
    };

    try {
      const response = await api.createOrder(orderData, token);
      clearCart();
      setOrderResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadSlip = async () => {
    if (!slipFile || !orderResult?.id) return;
    setIsUploadingSlip(true);
    setSlipUploadError("");
    try {
      await api.uploadBankSlip(orderResult.id, slipFile, token);
      setSlipUploadSuccess(true);
    } catch (err) {
      setSlipUploadError(err.message || "Failed to upload bank slip.");
    } finally {
      setIsUploadingSlip(false);
    }
  };

  // ORDER SUCCESS SCREEN
  if (orderResult) {
    const isBankTransfer = orderResult.payment_method === "bank_transfer";
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-2">
              <FiCheckCircle className="w-9 h-9" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Order Confirmed!</h2>
            <p className="text-slate-500 text-sm">
              Order #{orderResult.id} has been placed successfully. A confirmation has been sent to{" "}
              <span className="text-indigo-600 font-semibold">{orderResult.email}</span>.
            </p>
          </div>

          {/* BANK TRANSFER INSTRUCTIONS */}
          {isBankTransfer && (
            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <FiHome className="text-amber-600 w-5 h-5" />
                  <span className="font-semibold text-slate-900 tracking-wide">Bank Transfer Instructions</span>
                </div>
                <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2.5 py-1 rounded-full border border-amber-200">
                  Payment Required
                </span>
              </div>

              {/* Payment Reference Code */}
              <div className="bg-white p-4 rounded-xl border border-amber-200 text-center space-y-1 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Payment Reference</span>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-2xl font-black text-amber-600 tracking-wider">
                    {orderResult.bank_reference || "GENERATING..."}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(orderResult.bank_reference)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Copy reference"
                  >
                    {copiedRef ? <FiCheck className="text-emerald-600 w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-amber-700/90 flex items-center justify-center gap-1 mt-1">
                  <FiAlertCircle className="w-3.5 h-3.5" />
                  Please enter this exact reference in your bank transfer narration/remarks.
                </p>
              </div>

              {/* Bank Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <span className="text-slate-400 text-xs block">Bank Name</span>
                  <span className="font-medium text-slate-800">Commercial Bank</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Account Name</span>
                  <span className="font-medium text-slate-800">E-Commerce Store (Pvt) Ltd</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Account Number</span>
                  <span className="font-mono font-medium text-slate-800">1000 2345 6789</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Branch</span>
                  <span className="font-medium text-slate-800">Colombo City Branch</span>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Total Payable:</span>
                  <span className="text-xl font-bold text-emerald-600">${orderResult.total_amount?.toFixed(2)}</span>
                </div>
              </div>

              {/* Immediate Bank Slip Upload */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Upload Bank Transfer Slip (Optional now, or later in Dashboard)
                  </span>
                </div>

                {slipUploadSuccess ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-emerald-600" />
                    Bank slip uploaded successfully! Our team will review and verify your payment shortly.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf,.webp"
                        onChange={(e) => setSlipFile(e.target.files[0] || null)}
                        className="flex-1 text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer bg-slate-50 p-1.5 rounded-xl border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={handleUploadSlip}
                        disabled={!slipFile || isUploadingSlip}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <FiUploadCloud className="w-4 h-4" />
                        {isUploadingSlip ? "Uploading..." : "Upload Slip"}
                      </button>
                    </div>
                    {slipUploadError && (
                      <p className="text-xs text-rose-500">{slipUploadError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* COD NOTICE */}
          {!isBankTransfer && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold">
                <FiTruck className="w-5 h-5" />
                <span>Cash on Delivery</span>
              </div>
              <p className="text-sm text-slate-600">
                Please have <strong className="text-slate-900">${orderResult.total_amount?.toFixed(2)}</strong> ready in cash when the delivery agent arrives at your door.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-center text-sm transition-colors shadow-lg shadow-indigo-600/20"
            >
              View Order in Dashboard
            </Link>
            <Link
              href="/products"
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-center text-sm transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
          >
            <FiArrowLeft className="mr-2" />
            Back to Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Complete Your Order</h2>
                <p className="text-slate-500 text-sm mt-1">Please enter your delivery details and choose a payment method.</p>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center gap-3">
                  <FiAlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handlePlaceOrder} className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-bold">1</span>
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      required
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-bold">2</span>
                    Shipping Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      required
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      required
                    />
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="Street Address"
                      className="sm:col-span-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      required
                    />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        required
                      />
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="ZIP Code"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-bold">3</span>
                    Select Payment Method
                  </h3>
                  <div className="space-y-3">
                    {/* COD Option */}
                    <label
                      className={`flex items-start p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === "cod"
                          ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="mt-1 mr-3 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                          <FiTruck className="text-indigo-600" />
                          Cash on Delivery (COD)
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Pay with cash upon delivery of your items at your doorstep.
                        </p>
                      </div>
                    </label>

                    {/* Bank Transfer Option */}
                    <label
                      className={`flex items-start p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === "bank_transfer"
                          ? "border-amber-500 bg-amber-50/60 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentMethod === "bank_transfer"}
                        onChange={() => setPaymentMethod("bank_transfer")}
                        className="mt-1 mr-3 text-amber-500 focus:ring-amber-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                          <FiHome className="text-amber-600" />
                          Direct Bank Transfer
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          A unique reference code will be generated for your order. Transfer directly from your bank app or branch.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-bold tracking-wide transition-all shadow-lg shadow-indigo-600/20 text-sm flex items-center justify-center gap-2"
                >
                  <FiLock className="w-4 h-4" />
                  {isProcessing ? "Placing Order..." : `Place Order • $${total.toFixed(2)}`}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sticky top-8 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Order Summary</h3>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                    <div className="pr-3">
                      <p className="font-medium text-slate-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-800 font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="text-slate-800 font-medium">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax</span>
                  <span className="text-slate-800 font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-base pt-3 border-t border-slate-100">
                  <span>Total</span>
                  <span className="text-indigo-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center text-xs text-slate-500 gap-2 pt-2 border-t border-slate-100">
                <FiLock className="text-emerald-600 w-4 h-4" />
                <span>SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

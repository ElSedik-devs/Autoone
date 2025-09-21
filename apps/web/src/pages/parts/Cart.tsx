import { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { setQty, remove, clear } from "../../features/cart/cartSlice";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

type CheckoutResp = { orderIds: number[]; total: number };

export default function Cart() {
  const { t } = useTranslation("common");
  const items = useSelector((s: RootState) => s.cart.items);
  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigate();

  const [notes, setNotes] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<CheckoutResp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const list = useMemo(() => Object.values(items), [items]);
  const total = useMemo(
    () => list.reduce((sum, it) => sum + it.price * it.qty, 0),
    [list]
  );

  function openConfirm() {
    if (list.length === 0) return;
    setErr(null);
    setConfirmOpen(true);
  }

  async function placeOrder() {
    if (list.length === 0) return;
    setPlacing(true);
    setErr(null);
    try {
      const payload = {
        items: list.map((it) => ({ partId: it.id, qty: it.qty })),
        notes: notes || undefined,
      };
      const { data } = await api.post<CheckoutResp>("/parts/checkout", payload);
      setPlaced(data);
      dispatch(clear());
    } catch {
      setErr(t("parts.checkoutFail", { defaultValue: "Checkout failed." }));
    } finally {
      setPlacing(false);
    }
  }

  function goToOrders() {
    setConfirmOpen(false);
    nav("/my-part-orders");
  }

  // Prevent background scroll when modal open
  useEffect(() => {
    if (confirmOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [confirmOpen]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        {t("parts.cart", { defaultValue: "Cart" })}
      </h1>

      {/* Empty */}
      {list.length === 0 && !confirmOpen && !placed && (
        <div className="opacity-70">
          {t("parts.cartEmpty", { defaultValue: "Your cart is empty." })}
        </div>
      )}

      {/* Items */}
      {list.length > 0 && (
        <>
          <div className="space-y-3">
            {list.map((it) => (
              <div
                key={it.id}
                className="border rounded p-3 flex items-center gap-3"
              >
                {it.image_url && (
                  <img
                    src={it.image_url}
                    alt=""
                    className="w-20 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm">€{it.price.toFixed(2)}</div>
                </div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className="w-20 border rounded px-2 py-1"
                  value={it.qty}
                  onChange={(e) =>
                    dispatch(
                      setQty({
                        id: it.id,
                        qty: Math.max(
                          1,
                          Math.min(20, Number(e.target.value || 1))
                        ),
                      })
                    )
                  }
                />
                <div className="w-28 text-right font-semibold">
                  €{(it.qty * it.price).toFixed(2)}
                </div>
                <button
                  className="btn-outline"
                  onClick={() => dispatch(remove(it.id))}
                >
                  {t("remove", { defaultValue: "Remove" })}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder={t("notes", { defaultValue: "Notes" })}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xl font-semibold">
              {t("total", { defaultValue: "Total" })}: €{total.toFixed(2)}
            </div>
            <div className="flex gap-2">
              <button className="btn-outline" onClick={() => dispatch(clear())}>
                {t("clear", { defaultValue: "Clear" })}
              </button>
              <button className="btn-primary" onClick={openConfirm}>
                {t("checkout", { defaultValue: "Checkout" })}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Confirm Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmOpen(false)}
            aria-hidden="true"
          />
          {/* Dialog */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              className="
                w-full max-w-2xl rounded-2xl shadow-2xl
                bg-white text-neutral-900
                dark:bg-neutral-900 dark:text-neutral-100
                border border-neutral-200 dark:border-neutral-800
              "
            >
              {/* Content: before placing */}
              {!placed ? (
                <div className="p-5">
                  <h2 className="text-xl font-semibold mb-4">
                    {t("parts.review", { defaultValue: "Review your order" })}
                  </h2>

                  <div
                    className="
                      max-h-[50vh] overflow-y-auto rounded-lg border
                      border-neutral-200 dark:border-neutral-800
                    "
                  >
                    <table className="w-full text-sm">
                      <thead>
                        <tr
                          className="
                            bg-neutral-50 dark:bg-neutral-800
                            text-neutral-700 dark:text-neutral-200
                            border-b border-neutral-200 dark:border-neutral-800
                          "
                        >
                          <th className="text-left p-3">
                            {t("item", { defaultValue: "Item" })}
                          </th>
                          <th className="text-right p-3">
                            {t("parts.qty", { defaultValue: "Qty" })}
                          </th>
                          <th className="text-right p-3">
                            {t("price", { defaultValue: "Price" })}
                          </th>
                          <th className="text-right p-3">
                            {t("total", { defaultValue: "Total" })}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {list.map((it) => (
                          <tr
                            key={it.id}
                            className="hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                          >
                            <td className="p-3">{it.name}</td>
                            <td className="p-3 text-right">{it.qty}</td>
                            <td className="p-3 text-right">
                              €{it.price.toFixed(2)}
                            </td>
                            <td className="p-3 text-right">
                              €{(it.qty * it.price).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs sm:text-sm opacity-80">
                      {t("parts.notesInfo", {
                        defaultValue:
                          "Optional notes will be attached to each item.",
                      })}
                    </div>
                    <div className="text-lg font-semibold">
                      {t("total", { defaultValue: "Total" })}: €
                      {total.toFixed(2)}
                    </div>
                  </div>

                  {err && (
                    <div className="text-red-600 text-sm mt-2">{err}</div>
                  )}

                  <div className="flex gap-2 justify-end mt-4">
                   <button
  className="px-4 py-2 rounded-md font-medium
             bg-neutral-200 text-neutral-900
             hover:bg-neutral-300
             dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
  onClick={() => setConfirmOpen(false)}
>
  {t("cancel", { defaultValue: "Cancel" })}
</button>

                    <button
                      className="btn-primary"
                      disabled={placing}
                      onClick={placeOrder}
                    >
                      {placing
                        ? t("placing", { defaultValue: "Placing…" })
                        : t("placeOrder", { defaultValue: "Place order" })}
                    </button>
                  </div>
                </div>
              ) : (
                // Content: after placing
                <div className="p-5">
                  <h2 className="text-xl font-semibold mb-2">
                    {t("parts.checkoutOk", { defaultValue: "Order placed!" })}
                  </h2>
                  <div className="text-sm opacity-80 mb-3">
                    {t("parts.orderRef", {
                      defaultValue: "Your item order IDs:",
                    })}{" "}
                    {placed.orderIds.join(", ")}
                  </div>
                  <div className="text-lg font-semibold mb-4">
                    {t("total", { defaultValue: "Total" })}: €
                    {placed.total.toFixed(2)}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button className="btn-primary" onClick={goToOrders}>
                      {t("parts.viewOrders", {
                        defaultValue: "View my orders",
                      })}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

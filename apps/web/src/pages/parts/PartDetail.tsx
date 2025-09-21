import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { add } from "../../features/cart/cartSlice";
type Part = {
  id: number; category: string; name: string; price: number|string;
  stock: number; image_url?: string|null; compat?: string[]|null; description?: string|null;
};

export default function PartDetail() {
  const { t } = useTranslation("common");
  const { id } = useParams();
  const [item, setItem] = useState<Part | null>(null);
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await api.get<Part>(`/parts/${id}`);
      setItem(data);
      setLoading(false);
    })();
  }, [id]);

  async function order() {
    if (!item) return;
    try {
      await api.post("/part-orders", { partId: item.id, qty, notes: notes || undefined });
      alert(t("parts.ordered", { defaultValue: "Order placed." }));
    } catch {
      alert(t("parts.orderFail", { defaultValue: "Failed to place order." }));
    }
  }

  const priceNum = Number(item?.price ?? 0);
  const total = priceNum * qty;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {loading && <div>{t("loading", { defaultValue: "Loading…" })}</div>}
      {!loading && item && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            
            <div>
              {item.image_url && <img src={item.image_url} className="w-full rounded" alt="" />}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{item.name}</h1>
              <div className="opacity-80 capitalize">{item.category}</div>
              <div className="text-3xl font-bold mt-2">€{priceNum.toFixed(2)}</div>
              <div className="text-sm opacity-70">{t("parts.stock", { defaultValue: "In stock" })}: {item.stock}</div>

              {item.compat && item.compat.length > 0 && (
                <div className="mt-3 text-sm">
                  <div className="font-medium">{t("parts.compat", { defaultValue: "Compatible with" })}:</div>
                  <div className="opacity-80">{item.compat.join(", ")}</div>
                </div>
              )}

              {item.description && (
                <p className="mt-3 opacity-90">{item.description}</p>
              )}

              <div className="border rounded p-4 mt-5">
  <div className="grid sm:grid-cols-3 gap-2 items-end">
    <label className="text-sm">
      {t("parts.qty", { defaultValue: "Quantity" })}
      <input
        className="mt-1 border rounded px-2 py-2 w-full"
        type="number" min={1} max={20}
        value={qty}
        onChange={(e)=>setQty(Math.max(1, Math.min(20, Number(e.target.value||1))))}
      />
    </label>
    <div className="sm:col-span-2 text-right text-lg font-semibold">
      {t("total", { defaultValue: "Total" })}: €{total.toFixed(2)}
    </div>
  </div>

  <input
    className="border rounded px-3 py-2 mt-3 w-full"
    placeholder={t("notes", { defaultValue: "Notes" })}
    value={notes}
    onChange={(e)=>setNotes(e.target.value)}
  />

  <div className="flex gap-2 mt-3">
    <button
      className="btn-outline"
      onClick={()=>{
        if (!item) return;
        dispatch(add({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          image_url: item.image_url,
          qty,
        }));
        alert(t("parts.added", { defaultValue: "Added to cart." }));
      }}
    >
      {t("parts.add", { defaultValue: "Add to cart" })}
    </button>

    <button className="btn-primary" onClick={order}>
      {t("parts.orderCta", { defaultValue: "Order part" })}
    </button>

  </div>
</div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}

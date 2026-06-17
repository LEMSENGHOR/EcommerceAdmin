import { defineStore } from "pinia";
import api from "@/api/api.js";

export const useCartStore = defineStore("cart", {
  state: () => ({
    // ── Data ──
    cartItems: [],
    cart: null, // Full cart object with totals
    checkoutData: null,

    // ── UI Flags ──
    loading: false,
    adding: false,
    removing: false,
    updating: false,
    checkingOut: false,

    // ── Modal ──
    showCartModal: false,
    showCheckoutModal: false,

    // ── Form (for checkout) ──
    checkoutForm: {
      shipping_address: "",
      billing_address: "",
      phone: "",
      notes: "",
      payment_method: "credit_card",
    },

    // ── Toast ──
    toast: { show: false, message: "", type: "success" },
  }),

  getters: {
    // Total items in cart
    totalItems: (state) => {
      return state.cartItems.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0,
      );
    },

    // Calculate subtotal
    subtotal: (state) => {
      return state.cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0,
      );
    },

    // Calculate tax (assuming 10% - adjust as needed)
    tax: (state) => {
      return state.subtotal * 0.1;
    },

    // Calculate total
    total: (state) => {
      return state.subtotal + state.tax;
    },

    // Check if cart is empty
    isEmpty: (state) => state.cartItems.length === 0,

    // Get item by product ID
    getItemByProductId: (state) => (productId) => {
      return state.cartItems.find((item) => item.product_id === productId);
    },

    // Get item by cart item ID
    getItemById: (state) => (itemId) => {
      return state.cartItems.find((item) => item.id === itemId);
    },
  },

  actions: {
    // ───────────────────────────────────────────────
    // Toast helper
    // ───────────────────────────────────────────────
    showToast(message, type = "success") {
      this.toast = { show: true, message, type };
      setTimeout(() => {
        this.toast.show = false;
      }, 3000);
    },

    // ───────────────────────────────────────────────
    // Reset checkout form
    // ───────────────────────────────────────────────
    resetCheckoutForm() {
      this.checkoutForm = {
        shipping_address: "",
        billing_address: "",
        phone: "",
        notes: "",
        payment_method: "credit_card",
      };
    },

    // ───────────────────────────────────────────────
    // 1. FETCH CART
    //    GET /carts
    // ───────────────────────────────────────────────
    async fetchCart() {
      this.loading = true;
      try {
        const response = await api.get("/carts");
        const payload = response.data;

        // Support multiple response shapes
        if (payload.data && Array.isArray(payload.data.items)) {
          this.cart = payload.data;
          this.cartItems = payload.data.items;
        } else if (Array.isArray(payload)) {
          this.cartItems = payload;
          this.cart = { items: payload };
        } else if (payload.items && Array.isArray(payload.items)) {
          this.cart = payload;
          this.cartItems = payload.items;
        } else {
          this.cartItems = [];
          this.cart = { items: [] };
        }
      } catch (err) {
        this.handleError(err, "Failed to load cart");
      } finally {
        this.loading = false;
      }
    },

    // ───────────────────────────────────────────────
    // 2. ADD ITEM TO CART
    //    POST /carts
    // ───────────────────────────────────────────────
    async addToCart(payload) {
      this.adding = true;
      try {
        const response = await api.post("/carts", {
          product_id: payload.product_id,
          quantity: payload.quantity || 1,
          variant_id: payload.variant_id || null,
          price: payload.price || null,
        });

        const newItem =
          response.data.data || response.data.item || response.data;

        // Check if item already exists in cart
        const existingItemIndex = this.cartItems.findIndex(
          (item) =>
            item.product_id === payload.product_id &&
            (!payload.variant_id || item.variant_id === payload.variant_id),
        );

        if (existingItemIndex !== -1) {
          // Update quantity if item exists
          this.cartItems[existingItemIndex].quantity =
            (this.cartItems[existingItemIndex].quantity || 0) +
            (payload.quantity || 1);
        } else {
          // Add new item
          this.cartItems.push(newItem);
        }

        this.showToast("Item added to cart");
        this.showCartModal = true;
        return true;
      } catch (err) {
        this.handleError(err, "Failed to add item to cart");
        return false;
      } finally {
        this.adding = false;
      }
    },

    // ───────────────────────────────────────────────
    // 3. UPDATE CART ITEM QUANTITY
    //    POST /carts/{id} or PUT /carts/{id}
    // ───────────────────────────────────────────────
    async updateCartItemQuantity(itemId, quantity) {
      if (quantity < 1) return false;

      this.updating = true;
      try {
        const response = await api.post(`/carts/${itemId}`, {
          _method: "PUT", // Laravel support
          quantity: quantity,
        });

        // Update local state
        const idx = this.cartItems.findIndex((item) => item.id === itemId);
        if (idx !== -1) {
          this.cartItems[idx].quantity = quantity;
        }

        return true;
      } catch (err) {
        this.handleError(err, "Failed to update quantity");
        return false;
      } finally {
        this.updating = false;
      }
    },

    // ───────────────────────────────────────────────
    // 4. DELETE CART ITEM
    //    DELETE /carts/{id}
    // ───────────────────────────────────────────────
    async removeCartItem(itemId) {
      this.removing = true;
      try {
        await api.delete(`/carts/${itemId}`);
        this.cartItems = this.cartItems.filter((item) => item.id !== itemId);
        this.showToast("Item removed from cart");
        return true;
      } catch (err) {
        this.handleError(err, "Failed to remove item from cart");
        return false;
      } finally {
        this.removing = false;
      }
    },

    // ───────────────────────────────────────────────
    // 5. CLEAR CART
    //    DELETE /carts
    // ───────────────────────────────────────────────
    async clearCart() {
      this.removing = true;
      try {
        await api.delete("/carts");
        this.cartItems = [];
        this.cart = { items: [] };
        this.showToast("Cart cleared");
        return true;
      } catch (err) {
        this.handleError(err, "Failed to clear cart");
        return false;
      } finally {
        this.removing = false;
      }
    },

    // ───────────────────────────────────────────────
    // 6. CHECKOUT
    //    POST /carts/checkout
    // ───────────────────────────────────────────────
    async checkout() {
      this.checkingOut = true;
      try {
        const response = await api.post("/carts/checkout", this.checkoutForm);

        this.checkoutData = response.data.data || response.data;

        this.showToast("Order placed successfully!", "success");
        this.showCheckoutModal = false;
        this.resetCheckoutForm();

        // Clear cart after successful checkout
        await this.fetchCart();

        return this.checkoutData;
      } catch (err) {
        this.handleError(err, "Checkout failed");
        return false;
      } finally {
        this.checkingOut = false;
      }
    },

    // ───────────────────────────────────────────────
    // 7. APPLY COUPON (optional)
    //    POST /carts/coupon
    // ───────────────────────────────────────────────
    async applyCoupon(code) {
      this.loading = true;
      try {
        const response = await api.post("/carts/coupon", { code });

        // Update cart with coupon data
        if (response.data.data) {
          this.cart = response.data.data;
          this.cartItems = response.data.data.items || this.cartItems;
        }

        this.showToast("Coupon applied successfully");
        return true;
      } catch (err) {
        this.handleError(err, "Failed to apply coupon");
        return false;
      } finally {
        this.loading = false;
      }
    },

    // ───────────────────────────────────────────────
    // 8. REMOVE COUPON (optional)
    //    DELETE /carts/coupon
    // ───────────────────────────────────────────────
    async removeCoupon() {
      this.loading = true;
      try {
        const response = await api.delete("/carts/coupon");

        // Update cart without coupon
        if (response.data.data) {
          this.cart = response.data.data;
          this.cartItems = response.data.data.items || this.cartItems;
        }

        this.showToast("Coupon removed");
        return true;
      } catch (err) {
        this.handleError(err, "Failed to remove coupon");
        return false;
      } finally {
        this.loading = false;
      }
    },

    // ───────────────────────────────────────────────
    // Modal helpers
    // ───────────────────────────────────────────────
    openCartModal() {
      this.showCartModal = true;
      this.fetchCart();
    },

    closeCartModal() {
      this.showCartModal = false;
    },

    openCheckoutModal() {
      if (this.isEmpty) {
        this.showToast("Your cart is empty", "error");
        return;
      }
      this.showCheckoutModal = true;
      this.resetCheckoutForm();
    },

    closeCheckoutModal() {
      this.showCheckoutModal = false;
      this.resetCheckoutForm();
    },

    // ───────────────────────────────────────────────
    // Quick actions
    // ───────────────────────────────────────────────
    incrementQuantity(itemId) {
      const item = this.getItemById(itemId);
      if (item) {
        this.updateCartItemQuantity(itemId, item.quantity + 1);
      }
    },

    decrementQuantity(itemId) {
      const item = this.getItemById(itemId);
      if (item && item.quantity > 1) {
        this.updateCartItemQuantity(itemId, item.quantity - 1);
      } else if (item && item.quantity === 1) {
        // Optionally remove item or ask for confirmation
        this.removeCartItem(itemId);
      }
    },

    // ───────────────────────────────────────────────
    // Centralized error handler
    // ───────────────────────────────────────────────
    handleError(err, fallbackMessage) {
      const status = err.response?.status;
      const message = err.response?.data?.message || fallbackMessage;

      // Note: 401 errors are handled by the axios interceptor
      if (status === 403) {
        this.showToast("You don't have permission for this action.", "error");
        return;
      }

      // 422 → validation
      if (status === 422 && err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0]?.[0];
        this.showToast(firstError || message, "error");
        return;
      }

      // Handle out of stock errors
      if (status === 400 && message.includes("stock")) {
        this.showToast("Not enough stock available", "error");
        return;
      }

      this.showToast(message, "error");
    },
  },
});

# E-Commerce Application Architecture & Study Guide

This document serves as a study guide for the recent updates to the e-commerce platform. It outlines the architectural design patterns, the key technologies in use, and an explanation of the newly implemented Admin and Product Detail features.

## 1. Technology Stack

### Frontend (User Interface)
* **React + Vite:** The frontend is built using React for component-based UI and Vite as a blazing fast build tool.
* **React Router DOM:** Used for client-side routing (e.g., navigating from `/products` to `/product/:id` or to the Admin Dashboard).
* **Tailwind CSS:** A utility-first CSS framework used for styling. It allows for rapid prototyping and ensures a responsive, modern design without leaving the HTML.
* **Framer Motion:** Used for smooth entry animations (e.g., the fade-in effect on product images).

### Backend (API & Database)
* **FastAPI:** A modern, fast Python web framework for building APIs. It provides automatic interactive API documentation (Swagger UI).
* **SQLAlchemy:** The Python SQL toolkit and Object Relational Mapper (ORM) that gives application developers the full power and flexibility of SQL.
* **Pydantic:** Used for data validation and settings management using Python type annotations.
* **Alembic:** A lightweight database migration tool for usage with SQLAlchemy.
* **PostgreSQL (Assumed/Supported):** The relational database used to persist product, user, and review data.

---

## 2. Key Features Implemented

### 2.1 Dynamic Admin Categories
Previously, categories in the "Add Product" form were hardcoded. 
* **The Change:** The `<select>` dropdown was replaced with a combination `<input list="...">` and an HTML5 `<datalist>`.
* **Why it matters:** This hybrid approach allows the admin to either select an existing category dynamically fetched from the database (e.g., "Mobile Accessories") OR freely type a completely new category name (e.g., "Smartwatches"). 
* **How it works:** When the product is saved, the backend accepts this new string and it implicitly becomes a new filterable category on the frontend `ProductsPage`.

### 2.2 Dedicated Update Product Page
Previously, admins edited products via inline text fields in the Products table. This was limiting, especially for media uploads.
* **The Change:** A dedicated `UpdateProduct.jsx` component was created at the route `/admin/products/edit/:id`.
* **How it works:** 
  1. On mount, it fetches the existing product data using `api.getProduct(id)`.
  2. It pre-fills the form states and displays the current primary image or video.
  3. The admin can upload a new media file (which sends a request to the backend `/upload` endpoint).
  4. Finally, a `PUT` request is sent to `api.updateProduct()` containing the updated JSON payload (including new image/video URLs).

### 2.3 Product Detail Page Redesign
The product page was shifted from a tabbed interface to a modern, vertically-flowing layout.
* **Layout Structure:**
  * **Top Block (Side-by-Side):** The main focus area. The left side handles the media gallery (supporting both `<img />` and HTML5 `<video />` tags), while the right side handles crucial conversion info (Price, Rating, Quantity, Add to Cart).
  * **Middle Block (Vertical):** The detailed Description and Customer Reviews are stacked below.
  * **Bottom Block (Related Products):** A new section that queries the backend for other products matching the same `category`.
* **Data Fetching Strategy:** 
  * We use `Promise.all()` to fetch the Product details and the Reviews simultaneously, reducing total load time.
  * Once the product category is known, a subsequent fetch is fired to grab "Related Products".

---

## 3. Study Notes: Best Practices applied
* **Conditional Rendering:** You will notice a lot of ternary operators (`? :`) in the React code (e.g., `media.type === 'video' ? <video> : <img>`). This is crucial for rendering different UI based on data state.
* **Component State Separation:** `ProductDetailPage` manages several distinct pieces of state (`product`, `reviews`, `relatedProducts`, `activeMedia`, `quantity`). Keeping these separate allows for targeted updates (e.g., changing `activeMedia` doesn't trigger a full product re-fetch).
* **Controlled Forms:** Both `AddProduct` and `UpdateProduct` use "controlled components", where the form input values are strictly tied to React state (`formData`), ensuring React is the single source of truth.

Feel free to dive into `ProductDetailPage.jsx` and `UpdateProduct.jsx` to see these concepts in action!

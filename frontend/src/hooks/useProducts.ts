import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@/types";

// פונקציות עם קריאות fetch אמיתיות ל־backend

const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch("http://localhost:5000/api/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

const fetchProduct = async (id: string): Promise<Product> => {
  const res = await fetch(`http://localhost:5000/api/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
};

const createProduct = async (
  productData: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<Product> => {
  const res = await fetch("http://localhost:5000/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
};

const updateProduct = async (
  id: string,
  productData: Partial<Product>
): Promise<Product> => {
  const res = await fetch(`http://localhost:5000/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
};

const deleteProduct = async (id: string): Promise<void> => {
  const res = await fetch(`http://localhost:5000/api/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
};

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
    enabled: !!id && id !== "new",
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["lowStockProducts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["lowStockProducts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["lowStockProducts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}

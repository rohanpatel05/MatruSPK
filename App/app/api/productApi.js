import axios from "axios";
import { BASE_URL } from "../config/URL";
import { useQuery } from "@tanstack/react-query";
import { GET_NON_HIDDEN_PRODUCTS_QUERY_KEY } from "../config/queryKeys";

const productApi = axios.create({
  baseURL: BASE_URL,
});

export const ProductUrlEndpoint = "/products";

export const getNonHiddenProducts = () => {
  const { data, isError, error, isLoading } = useQuery({
    queryKey: [GET_NON_HIDDEN_PRODUCTS_QUERY_KEY],
    queryFn: async () => {
      const { data } = await productApi.get(
        `${ProductUrlEndpoint}/getAvailable`
      );
      return data;
    },
  });

  return { data, isError, error, isLoading };
};

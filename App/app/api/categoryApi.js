import axios from "axios";
import { BASE_URL } from "../config/URL";
import { useQuery } from "@tanstack/react-query";
import { GET_NON_HIDDEN_CATEGORIES_QUERY_KEY } from "../config/queryKeys";

const categoryApi = axios.create({
  baseURL: BASE_URL,
});

export const CategoryUrlEndpoint = "/categories";

export const getNonHiddenCategories = () => {
  const allCat = { category_id: 0, name: "All" };

  const { data, isError, error, isLoading } = useQuery({
    queryKey: [GET_NON_HIDDEN_CATEGORIES_QUERY_KEY],
    queryFn: async () => {
      const { data } = await categoryApi.get(
        `${CategoryUrlEndpoint}/getAvailable`
      );
      return [allCat, ...data];
    },
  });

  return { data, isError, error, isLoading };
};

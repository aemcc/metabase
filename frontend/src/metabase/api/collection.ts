import type {
  Collection,
  CreateCollectionRequest,
  DeleteCollectionRequest,
  ListCollectionItemsRequest,
  ListCollectionItemsResponse,
  ListCollectionsRequest,
  ListCollectionsTreeRequest,
  UpdateCollectionRequest,
  getCollectionRequest,
} from "metabase-types/api";

import { Api } from "./api";
import {
  idTag,
  invalidateTags,
  listTag,
  provideCollectionItemListTags,
  provideCollectionListTags,
  provideCollectionTags,
} from "./tags";

export const collectionApi = Api.injectEndpoints({
  endpoints: builder => ({
    /**
     * @deprecated This endpoint is extremely slow on large instances, it should not be used
     * you probably only need a few collections, just fetch those
     */
    listCollections: builder.query<Collection[], ListCollectionsRequest>({
      query: params => ({
        method: "GET",
        url: `/api/collection`,
        params,
      }),
      providesTags: (collections = []) =>
        provideCollectionListTags(collections),
    }),
    listCollectionsTree: builder.query<
      Collection[],
      ListCollectionsTreeRequest
    >({
      query: params => ({
        method: "GET",
        url: "/api/collection/tree",
        params,
      }),
      providesTags: (collections = []) =>
        provideCollectionListTags(collections),
    }),
    listCollectionItems: builder.query<
      ListCollectionItemsResponse,
      ListCollectionItemsRequest
    >({
      query: ({ id, ...params }) => ({
        method: "GET",
        url: `/api/collection/${id}/items`,
        params,
      }),
      providesTags: (response, error, { models }) =>
        provideCollectionItemListTags(response?.data ?? [], models),
    }),
    getCollection: builder.query<Collection, getCollectionRequest>({
      query: ({ id, ...params }) => {
        return {
          method: "GET",
          url: `/api/collection/${id}`,
          params,
        };
      },
      providesTags: collection =>
        collection ? provideCollectionTags(collection) : [],
    }),
    createCollection: builder.mutation<Collection, CreateCollectionRequest>({
      query: body => ({
        method: "POST",
        url: "/api/collection",
        body,
      }),
      invalidatesTags: (collection, error) =>
        collection
          ? [
              ...invalidateTags(error, [listTag("collection")]),
              ...invalidateTags(error, [
                idTag("collection", collection.parent_id ?? "root"),
              ]),
            ]
          : [],
    }),
    updateCollection: builder.mutation<Collection, UpdateCollectionRequest>({
      query: ({ id, ...body }) => ({
        method: "PUT",
        url: `/api/collection/${id}`,
        body,
      }),
      invalidatesTags: (_, error, { id }) =>
        invalidateTags(error, [listTag("collection"), idTag("collection", id)]),
    }),
    deleteCollection: builder.mutation<void, DeleteCollectionRequest>({
      query: ({ id, ...body }) => ({
        method: "DELETE",
        url: `/api/collection/${id}`,
        body,
      }),
      invalidatesTags: (_, error, { id }) =>
        invalidateTags(error, [listTag("collection"), idTag("collection", id)]),
    }),
  }),
});

export const {
  useListCollectionsQuery,
  useListCollectionsTreeQuery,
  useListCollectionItemsQuery,
  useGetCollectionQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
} = collectionApi;

import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";


const usersAdapter = createEntityAdapter({})

const initialState = usersAdapter.getInitialState()


export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getUsers: builder.query({
            query: () => '/users',
            validateStatus: (response, result) => {
                return response.status === 200 && !result.isError
            },
            keepUnusedDataFor: 5,
            transformResponse: responseData => {
                const loadedUsers = responseData.map( user => {
                    user.id = user._id
                    return user
                });
                   return usersAdapter.setAll(initialState, loadedUsers)
            },
            providesTags: (result , error, arg) => {
                if(!result?.ids){
                    return [
                    {type: 'User', id: 'LIST'},
                    ...result.ids.map(id => ({ type:'User', id}))
                    ]
                } else return[{ type:'User', id:'LIST'}]
            }
        }),

        addNewUser: builder.mutation({
            query: initialUserData => ({
                url: '/users',
                method: 'POST',
                body: {
                    ...initialUserData,
                }
            }),
            invalidatesTags: [
                { type: 'User', id: "LIST" }
            ]
        }),
        updateUser: builder.mutation({
            query: initialUserData => ({
                url: '/users',
                method: 'PATCH',
                body: {
                    ...initialUserData,
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'User', id: arg.id }
            ]
        }),
        deleteUser: builder.mutation({
            query: ({ id }) => ({
                url: `/users`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'User', id: arg.id }
            ]
        }),
    }),
})

export const {
    useGetUsersQuery,
    useAddNewUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation
} = usersApiSlice


//return the query result object
export const selectUsersResult = usersApiSlice.endpoints.getUsers.select()

//creates memoized selector
const selectUsersData = createSelector(
    selectUsersResult,
    usersResult => usersResult.data //normalise state object with ids & entity
)
// get selectors create these selectors and then we rename with aliases using destructuring

export const {
    selectAll : selectAllUsers,
    selectById: selectUserById,
    selectIds: selectUserIds
    // pass in the selector that return the user Slice of the state
} = usersAdapter.getSelectors(state => selectUsersData(state) ?? initialState)
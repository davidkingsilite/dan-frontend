import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";


const notesAdapter = createEntityAdapter({
    sortComparer: (a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1
})

const initialState = notesAdapter.getInitialState()


export const notesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getNotes: builder.query({
            query: () => '/notes',
            validateStatus: (response, result) => {
                return response.status === 200 && !result.isError
            },
            keepUnusedDataFor: 5,
            transformResponse: responseData => {
                const loadedNotes = responseData.map( note => {
                    note.id = note._id
                    return note
                });
                   return notesAdapter.setAll(initialState, loadedNotes)
            },
            providesTags: (result , error, arg) => {
                if(!result?.ids){
                    return [
                    {type: 'Note', id: 'LIST'},
                    ...result.ids.map(id => ({ type:'Note', id}))
                    ]
                } else return[{ type:'Note', id:'LIST'}]
            }
        }),
        addNewNote: builder.mutation({
            query: initialNote => ({
                url: '/notes',
                method: 'POST',
                body: {
                    ...initialNote,
                }
            }),
            invalidatesTags: [
                { type: 'Note', id: "LIST" }
            ]
        }),
        updateNote: builder.mutation({
            query: initialNote => ({
                url: '/notes',
                method: 'PATCH',
                body: {
                    ...initialNote,
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Note', id: arg.id }
            ]
        }),
        deleteNote: builder.mutation({
            query: ({ id }) => ({
                url: `/notes`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Note', id: arg.id }
            ]
        }),
    
    }),
})

export const {
    useGetNotesQuery,
    useAddNewNoteMutation,
    useUpdateNoteMutation,
    useDeleteNoteMutation
} = notesApiSlice


//return the query result object
export const selectNotesResult = notesApiSlice.endpoints.getNotes.select()

//creates memoized selector
const selectNotesData = createSelector(
    selectNotesResult,
    notesResult => notesResult.data //normalise state object with ids & entity
)
// get selectors create these selectors and then we rename with aliases using destructuring

export const {
    selectAll : selectAllNotes,
    selectById: selectNoteById,
    selectIds: selectNotesIds
    // pass in the selector that return the note sclice of the state
} = notesAdapter.getSelectors(state => selectNotesData(state) ?? initialState)
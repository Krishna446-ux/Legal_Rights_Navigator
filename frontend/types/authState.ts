export type authState = {
    profile: {
        name?: string,
        email?: string,
        sub?: string
    },
    loading: boolean
}
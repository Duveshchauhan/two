import { NextResponse } from "next/server";

export function middleware(request) {

    // TODO: token verification has to be implemented on server
    let user = request.cookies.get('user')
    if (!user) {
        return NextResponse.redirect(
            new URL('/', request.url)
        )
    }
    return NextResponse.next()
}

export const config = {
    matcher: ['/chat']
}
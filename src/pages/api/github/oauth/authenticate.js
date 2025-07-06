import { decrypt } from "../../../../lib/utils/crypto.js";
import app from "../../../../lib/octokit/app.js";

/**
 * GitHub OAuth Authentication route handler
 * @param {import("astro").APIContext} context
 */
export async function GET({ cookies }) {
    const accessToken = cookies.get("jargonsdevToken", {
        decode: (value) => decrypt(value),
    });

    if (!accessToken) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: "No token provided" 
        }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const userOctokit = app.getUserOctokit({ token: accessToken.value });
        const { data } = await userOctokit.request("GET /user");

        console.log("Authenticated user data:", data);

        // Token is valid, grant session access and send user data
        return new Response(JSON.stringify({
            success: true, 
            message: "Authentication successful", 
            data
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Authentication failed", 
            details: error.message 
        }), {
            status: error.status || 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
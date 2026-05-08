import asyncio
import json
import httpx

async def test_rag_chat():
    url = "http://localhost:8000/chat"
    
    # Test 1: Platform knowledge (ELA)
    print("\n--- Testing ELA Knowledge ---")
    payload = {"message": "How does ELA work on this platform?"}
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, timeout=30.0)
        print(f"User: {payload['message']}")
        print(f"Bot: {response.json()['reply']}")

    # Test 2: Specific Certificate (Shivika Verma)
    print("\n--- Testing Certificate Retrieval (Shivika) ---")
    payload = {"message": "Can you tell me about Shivika Verma's certificate status?"}
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, timeout=30.0)
        print(f"User: {payload['message']}")
        print(f"Bot: {response.json()['reply']}")

if __name__ == "__main__":
    asyncio.run(test_rag_chat())

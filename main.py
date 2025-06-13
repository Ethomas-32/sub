from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from openai import AzureOpenAI
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Enhanced CORS configuration for direct frontend calls
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    },
    r"/health": {
        "origins": "*",
        "methods": ["GET"]
    }
})

# Initialize Azure OpenAI client
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version="2025-01-01-preview",
    azure_endpoint=os.getenv("ENDPOINT_URL")
)

# This is now just plain text for the system prompt
system_message = {
    "role": "system",
    "content": (
        "Respond to all user queries with clear, helpful, and empathetic explanations. "
        "When you base your answers on documents or sources, do NOT include any citation tags, reference markers, or bracketed document references such as '[doc1]', '[doc5]', or similar in your response. "
        "Simply incorporate the information smoothly into your answer, avoiding any visible citations or internal document tags.\n\n"
        "Keep your responses easy to understand, warm, and well-structured with paragraphs and line breaks. Avoid explicit section headings but organize the text naturally.\n\n"
        "Format your response in Markdown when appropriate for better readability.\n\n"
        "Example output:\n\n"
        "It's great that you want to manage your unread items efficiently in a grid view. Here's a step-by-step guide on how you can mark unread items as read.\n\n"
        "1. Identify Unread Items: Look for items in your grid that are marked as unread, typically highlighted or with a specific icon.\n"
        "2. Use the Mark as Read Button: Find and click the \"Mark as Read\" button in your grid view.\n"
        "3. Perform the Action: This should update the status quickly.\n"
        "4. Check Visibility Conditions: The button is visible only when you have permission and the item is unread.\n"
        "5. Confirm the Change: The unread mark should disappear after marking as read.\n\n"
        "If the button is not visible, check your permissions and item status.\n\n"
        "Feel free to ask if you need more help!"
    )
}

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Flask server is running',
        'port': 5001
    }), 200

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
    try:
        # Get the message from request
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
            
        user_message = data['message']

        # Messages should be plain text, not structured with `type: text`
        messages = [
            system_message,
            {"role": "user", "content": user_message}
        ]

        completion = client.chat.completions.create(
            model=os.getenv("DEPLOYMENT_NAME"),  # your Azure deployment name
            messages=messages,
            max_tokens=800,
            temperature=0.7,
            extra_body={
                "data_sources": [{
                    "type": "azure_search",
                    "parameters": {
                        "endpoint": os.getenv("SEARCH_ENDPOINT"),
                        "index_name": "large-data-index-v10",
                        "semantic_configuration": "default",
                        "query_type": "semantic",
                        "fields_mapping": {
                            "content_fields_separator": "\n",
                            "content_fields": [
                                "content",
                                "resolution",
                                "description",
                                "symptom"
                            ]
                        },
                        "authentication": {
                            "type": "api_key",
                            "key": os.getenv("SEARCH_KEY")
                        }
                    }
                }]
            }
        )

        response = jsonify({'response': completion.choices[0].message.content})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        return response

    except Exception as e:
        print(f"Error: {str(e)}")  # Add logging
        error_response = jsonify({'error': str(e)})
        error_response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        return error_response, 500

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0')
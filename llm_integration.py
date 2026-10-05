import os
import openai
from flask import Flask, Blueprint, request, jsonify

# Set OpenAI API key
openai.api_key = os.environ.get('OPENAI_API_KEY')

# Create a Flask blueprint for the LLM integration
chatbot_bp = Blueprint('chatbot', __name__)

@chatbot_bp.route('/suggestions', methods=['POST'])
def get_suggestions():
    """
    Endpoint to get payment suggestions from the LLM.
    Expected JSON payload:
    """
    data = request.get_json() or {}
    query = data.get('query', '')
    transactions = data.get('transactions', [])

    context = f"Transaction history: {transactions}" if transactions else "No transaction history available."

    prompt = (
        f"You are a financial assistant for a peer-to-peer payment app.\n"
        f"The user asked: \"{query}\"\n"
        f"{context}\n"
        "Provide suggestions on whether this payment is advisable along with insights on how it fits into the user’s overall financial behavior."
    )

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a financial assistant specialized in peer-to-peer payments."},
                {"role": "user", "content": prompt}
            ]
        )
        suggestion = response['choices'][0]['message']['content']
        return jsonify({"suggestion": suggestion}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chatbot_bp.route('/analytics', methods=['POST'])
def get_analytics():
    """
    Endpoint to get analytics insights from the LLM based on user transactions.
    Expected JSON payload:
    {
      "transactions": [
          {"amount": 50, "date": "2025-04-01", "recipient": "Bob", "category": "dinner"},
          ...
      ]
    }
    """
    data = request.get_json() or {}
    transactions = data.get('transactions', [])

    # Create a prompt that asks the LLM to analyze the user's transaction history.
    prompt = (
        f"You are a financial analyst for a peer-to-peer payment app.\n"
        f"Here is the user's transaction history: {transactions}\n"
        "Provide insights about the user's spending habits, trends, and any suggestions for optimizing their payments."
    )

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a financial analyst specialized in peer-to-peer payments."},
                {"role": "user", "content": prompt}
            ]
        )
        analytics = response['choices'][0]['message']['content']
        return jsonify({"analytics": analytics}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def create_app():
    app = Flask(__name__)
    app.register_blueprint(chatbot_bp, url_prefix='/api/llm')
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import pandas as pd
import pickle
import numpy as np
from sklearn import preprocessing
from sklearn.tree import DecisionTreeClassifier, _tree
from sklearn.model_selection import train_test_split
import warnings
import json

warnings.filterwarnings("ignore", category=DeprecationWarning)

app = Flask(__name__)
CORS(app)

# -------------------- Load Data --------------------
try:
    training = pd.read_csv('Data/Training.csv')
    testing = pd.read_csv('Data/Testing.csv')
    
    cols = training.columns[:-1]
    x = training[cols]
    y = training['prognosis']

    # mapping strings to numbers
    le = preprocessing.LabelEncoder()
    le.fit(y)
    y = le.transform(y)

    # train-test split
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.33, random_state=42)

    # Decision Tree
    clf = DecisionTreeClassifier()
    clf.fit(x_train, y_train)
    
    # Reduced data for symptoms
    reduced_data = training.groupby(training['prognosis']).max()
    
    print("ML Models loaded successfully!")
    
except Exception as e:
    print(f"Error loading ML models: {e}")
    clf = None
    reduced_data = None

# -------------------- Load Dictionaries --------------------
try:
    severityDictionary = {}
    description_list = {}
    precautionDictionary = {}
    
    # Load severity dictionary
    with open('MasterData/symptom_severity.csv', 'r') as f:
        for line_num, line in enumerate(f, 1):
            try:
                parts = line.strip().split(',')
                if len(parts) >= 2:
                    severityDictionary[parts[0].strip()] = int(parts[1].strip())
            except Exception as e:
                print(f"Error in severity file line {line_num}: {e}")
    
    # Load descriptions
    with open('MasterData/symptom_Description.csv', 'r') as f:
        for line_num, line in enumerate(f, 1):
            try:
                parts = line.strip().split(',', 1)
                if len(parts) >= 2:
                    description_list[parts[0].strip()] = parts[1].strip()
            except Exception as e:
                print(f"Error in description file line {line_num}: {e}")
    
    # Load precautions
    with open('MasterData/symptom_precaution.csv', 'r') as f:
        for line_num, line in enumerate(f, 1):
            try:
                parts = line.strip().split(',')
                if len(parts) >= 5:
                    precautionDictionary[parts[0].strip()] = [parts[1].strip(), parts[2].strip(), parts[3].strip(), parts[4].strip()]
            except Exception as e:
                print(f"Error in precaution file line {line_num}: {e}")
                
    symptoms_dict = {symptom: index for index, symptom in enumerate(x)}
    print("Dictionaries loaded successfully!")
    
except Exception as e:
    print(f"Error loading dictionaries: {e}")
    severityDictionary = {}
    description_list = {}
    precautionDictionary = {}
    symptoms_dict = {}

# -------------------- Utility Functions --------------------
def calc_condition(exp, days):
    if not exp:
        return "Unable to calculate condition severity."
    
    total = 0
    for item in exp:
        if item in severityDictionary:
            total += severityDictionary[item]
    
    if len(exp) == 0:
        return "No symptoms provided for calculation."
    
    if (total * days) / (len(exp) + 1) > 13:
        return "⚠️ You should take the consultation from doctor. The condition appears to be serious."
    else:
        return "🙂 It might not be that bad but you should take precautions."

def check_pattern(dis_list, inp):
    inp = inp.replace(' ', '_')
    regexp = re.compile(f"{inp}", re.IGNORECASE)
    pred_list = [item for item in dis_list if regexp.search(item)]
    return (1, pred_list) if pred_list else (0, [])

def sec_predict(symptoms_exp):
    try:
        df = pd.read_csv('Data/Training.csv')
        X = df.iloc[:, :-1]
        y = df['prognosis']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=20)
        rf_clf = DecisionTreeClassifier()
        rf_clf.fit(X_train, y_train)

        symptoms_dict_local = {symptom: index for index, symptom in enumerate(X)}
        input_vector = np.zeros(len(symptoms_dict_local))
        
        for item in symptoms_exp:
            if item in symptoms_dict_local:
                input_vector[symptoms_dict_local[item]] = 1

        return rf_clf.predict(pd.DataFrame([input_vector], columns=X.columns))

    except Exception as e:
        print(f"Error in sec_predict: {e}")
        return ["Unknown"]

def print_disease(node):
    try:
        node = node[0]
        val = node.nonzero()
        disease = le.inverse_transform(val[0])
        return [d.strip() for d in disease]
    except Exception as e:
        print(f"Error in print_disease: {e}")
        return ["Unknown"]

# -------------------- Session Management --------------------
user_sessions = {}

class DiagnosisSession:
    def __init__(self):
        self.step = 'symptom'
        self.initial_symptom = None
        self.symptoms_present = []
        self.num_days = None
        self.current_questions = []
        self.current_question_index = 0
        self.diagnosis_result = None
        
    def to_dict(self):
        return {
            'step': self.step,
            'initial_symptom': self.initial_symptom,
            'symptoms_present': self.symptoms_present,
            'num_days': self.num_days,
            'current_questions': self.current_questions,
            'current_question_index': self.current_question_index,
            'diagnosis_result': self.diagnosis_result
        }

# -------------------- Main API Endpoint --------------------
@app.route('/diagnose', methods=['POST'])
def diagnose():
    try:
        data = request.json
        message = data.get('message', '').strip()
        session_id = data.get('session_id', 'default')
        step = data.get('step', 'symptom')
        context_data = data.get('context')
        
        # Get or create session
        if session_id not in user_sessions:
            user_sessions[session_id] = DiagnosisSession()
        
        session = user_sessions[session_id]
        
        # Restore session from context if provided
        if context_data and isinstance(context_data, dict):
            for key, value in context_data.items():
                if hasattr(session, key):
                    setattr(session, key, value)
        
        response = ""
        completed = False
        
        if session.step == 'symptom':
            # Initial symptom input
            chk_dis = list(x.columns)
            conf, cnf_dis = check_pattern(chk_dis, message)
            
            if conf == 1:
                if len(cnf_dis) > 1:
                    response = f"I found multiple related symptoms:\n"
                    for i, symptom in enumerate(cnf_dis[:5]):
                        response += f"{i+1}. {symptom.replace('_', ' ')}\n"
                    response += "\n📝 Please type the number of the symptom you meant (1-5):"
                    session.current_questions = cnf_dis[:5]
                    session.step = 'symptom_selection'
                else:
                    session.initial_symptom = cnf_dis[0]
                    response = f"✅ Got it! You're experiencing: **{cnf_dis[0].replace('_', ' ')}**\n\n📅 For how many days have you been experiencing this symptom? Please enter a number."
                    session.step = 'days'
            else:
                response = "❓ I couldn't recognize that symptom. Please describe your main symptom more clearly.\n\n💡 Examples: 'fever', 'headache', 'cough', 'stomach pain', etc."
                
        elif session.step == 'symptom_selection':
            try:
                selection = int(message) - 1
                if 0 <= selection < len(session.current_questions):
                    session.initial_symptom = session.current_questions[selection]
                    response = f"✅ Got it! You're experiencing: **{session.initial_symptom.replace('_', ' ')}**\n\n📅 For how many days have you been experiencing this symptom? Please enter a number."
                    session.step = 'days'
                else:
                    response = "❌ Please enter a valid number from the options shown above."
            except ValueError:
                response = "❌ Please enter a valid number (1-5)."
                
        elif session.step == 'days':
            try:
                session.num_days = int(message)
                if session.num_days <= 0:
                    response = "❌ Please enter a positive number of days."
                else:
                    response, next_step = start_tree_traversal(session)
                    session.step = next_step
            except ValueError:
                response = "❌ Please enter a valid number of days."
                
        elif session.step == 'questions':
            answer = message.lower().strip()
            if answer in ['yes', 'y', 'no', 'n']:
                if answer in ['yes', 'y']:
                    current_symptom = session.current_questions[session.current_question_index]
                    session.symptoms_present.append(current_symptom)
                
                session.current_question_index += 1
                
                if session.current_question_index < len(session.current_questions):
                    next_symptom = session.current_questions[session.current_question_index]
                    progress = f"({session.current_question_index + 1}/{len(session.current_questions)})"
                    response = f"🔍 **Question {progress}**\n\nAre you experiencing: **{next_symptom.replace('_', ' ')}**?\n\n✅ Please answer **'yes'** or **'no'**"
                else:
                    response, completed = provide_final_diagnosis(session)
                    session.step = 'completed'
            else:
                response = "❌ Please answer **'yes'** or **'no'** to the symptom question."
                
        elif session.step == 'completed':
            # For ML only mode, don't respond to further messages
            response = "Session has ended. Please start a new diagnosis if needed."
            completed = True
            
        return jsonify({
            'response': response,
            'step': session.step,
            'context': session.to_dict(),
            'completed': completed
        })
        
    except Exception as e:
        print(f"Error in diagnose endpoint: {e}")
        return jsonify({
            'error': f'Diagnosis service error: {str(e)}'
        }), 500

def start_tree_traversal(session):
    try:
        if clf is None or reduced_data is None:
            return "❌ ML models not available. Please check the data files.", 'error'
            
        symptom_col = session.initial_symptom
        if symptom_col in training.columns:
            related_diseases = training[training[symptom_col] == 1]['prognosis'].unique()
            
            if len(related_diseases) > 0:
                related_symptoms = set()
                for disease in related_diseases[:3]:
                    disease_data = training[training['prognosis'] == disease]
                    for col in training.columns[:-1]:
                        if col != symptom_col and disease_data[col].mean() > 0.4:
                            related_symptoms.add(col)
                
                if related_symptoms:
                    session.current_questions = list(related_symptoms)[:5]
                    session.current_question_index = 0
                    first_symptom = session.current_questions[0]
                    return f"🔍 **Question (1/{len(session.current_questions)})**\n\nAre you experiencing: **{first_symptom.replace('_', ' ')}**?\n\n✅ Please answer **'yes'** or **'no'**", 'questions'
        
        # Fallback
        common_symptoms = ['fever', 'headache', 'fatigue', 'nausea', 'vomiting']
        available_symptoms = [s for s in common_symptoms if s in symptoms_dict and s != session.initial_symptom]
        
        if available_symptoms:
            session.current_questions = available_symptoms[:3]
            session.current_question_index = 0
            first_symptom = session.current_questions[0]
            return f"🔍 **Question (1/{len(session.current_questions)})**\n\nAre you experiencing: **{first_symptom.replace('_', ' ')}**?\n\n✅ Please answer **'yes'** or **'no'**", 'questions'
        else:
            return provide_basic_diagnosis(session), 'completed'
            
    except Exception as e:
        print(f"Error in start_tree_traversal: {e}")
        return "❌ Error in symptom analysis. Please try again.", 'error'

def provide_final_diagnosis(session):
    try:
        all_symptoms = [session.initial_symptom] + session.symptoms_present
        
        # Get predictions
        second_prediction = sec_predict(all_symptoms)
        condition_assessment = calc_condition(all_symptoms, session.num_days)
        
        # Find primary disease
        input_vector = np.zeros(len(symptoms_dict))
        for symptom in all_symptoms:
            if symptom in symptoms_dict:
                input_vector[symptoms_dict[symptom]] = 1
        
        try:
            primary_prediction = clf.predict(pd.DataFrame([input_vector], columns=x.columns))

            primary_disease = le.inverse_transform(primary_prediction)[0]
        except Exception as e:
            print(f"Error in primary prediction: {e}")
            primary_disease = "Unknown"
        
        # Build response
        response = f"🎯 **DIAGNOSIS COMPLETED**\n\n"
        response += f"📋 **Your Symptoms:** {', '.join([s.replace('_', ' ') for s in all_symptoms])}\n"
        response += f"📅 **Duration:** {session.num_days} days\n\n"
        
        if primary_disease != "Unknown":
            response += f"🏥 **Most Likely Condition:** **{primary_disease}**\n\n"
            
            if primary_disease in description_list:
                response += f"📖 **About this condition:**\n{description_list[primary_disease]}\n\n"
            
            if primary_disease in precautionDictionary:
                response += f"💊 **Recommended Precautions:**\n"
                for i, precaution in enumerate(precautionDictionary[primary_disease], 1):
                    if precaution.strip():
                        response += f"{i}. {precaution}\n"
                response += "\n"
        
        response += f"📊 **Severity Assessment:** {condition_assessment}\n\n"
        
        if len(second_prediction) > 0:
            secondary_disease = second_prediction[0]
            if secondary_disease != primary_disease:
                response += f"🔄 **Alternative Possibility:** {secondary_disease}\n\n"
        
        response += "⚠️ **IMPORTANT DISCLAIMER:**\nThis is an AI-based preliminary assessment. Always consult with a healthcare professional for proper diagnosis and treatment.\n\n"
        response += "🙏 **Thank you for using our diagnosis service!**"
        
        # Store result
        session.diagnosis_result = {
            'primary_disease': primary_disease,
            'secondary_disease': secondary_disease if len(second_prediction) > 0 else None,
            'symptoms': all_symptoms,
            'severity_assessment': condition_assessment,
            'duration_days': session.num_days
        }
        
        return response, True
        
    except Exception as e:
        print(f"Error in provide_final_diagnosis: {e}")
        return "❌ Error generating diagnosis. Please consult a healthcare professional.", True

def provide_basic_diagnosis(session):
    try:
        symptom = session.initial_symptom
        
        response = f"🔍 **BASIC ASSESSMENT**\n\n"
        response += f"📋 **Main Symptom:** {symptom.replace('_', ' ')}\n"
        response += f"📅 **Duration:** {session.num_days} days\n\n"
        
        if session.num_days > 7:
            response += "⚠️ Since you've been experiencing this symptom for more than a week, it's recommended to consult a healthcare professional.\n\n"
        elif session.num_days > 3:
            response += "📈 Monitor your symptoms. If they worsen or persist, consider consulting a healthcare professional.\n\n"
        else:
            response += "📊 Continue monitoring your symptoms. Most acute symptoms resolve within a few days.\n\n"
        
        response += "⚠️ **IMPORTANT:** This is a basic assessment. For accurate diagnosis and treatment, please consult with a healthcare professional.\n\n"
        response += "🙏 **Thank you for using our diagnosis service!**"
        
        return response
        
    except Exception as e:
        print(f"Error in provide_basic_diagnosis: {e}")
        return "Please consult a healthcare professional for proper evaluation."

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'models_loaded': clf is not None,
        'symptoms_count': len(symptoms_dict),
        'diseases_count': len(description_list)
    })

if __name__ == '__main__':
    print("Starting ML Diagnosis Service...")
    print(f"Training data shape: {training.shape if 'training' in locals() else 'Not loaded'}")
    print(f"Symptoms available: {len(symptoms_dict)}")
    print(f"Severity entries: {len(severityDictionary)}")
    print(f"Description entries: {len(description_list)}")
    print(f"Precaution entries: {len(precautionDictionary)}")
    app.run(debug=True, host='0.0.0.0', port=8000)





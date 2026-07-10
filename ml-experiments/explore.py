# import pandas as pd
# import os

# # This guarantees Python finds the file no matter where you click "Play" from
# script_dir = os.path.dirname(os.path.abspath(__file__))
# file_path = os.path.join(script_dir, "adhd200_preprocessed_phenotypics.tsv")

# # 1. Load the dataset
# df = pd.read_csv(file_path, sep="\t")

# # 2. Pick ONLY the columns we care about for a simple app quiz!
# # We want Demographics + Symptoms to predict DX (Diagnosis)
# useful_columns = ['Age', 'Gender', 'Inattentive', 'Hyper/Impulsive', 'DX']

# # Create a new, clean table with just those columns
# clean_df = df[useful_columns].copy()

# # 3. Clean the data (Drop missing values and weird "-999" placeholders)
# clean_df = clean_df.dropna()
# clean_df = clean_df[(clean_df != -999).all(axis=1)]

# # 4. Print out our new, clean dataset!
# print("--- CLEAN DATASET ---")
# print(f"Total people left after cleaning: {clean_df.shape[0]}")
# print("\nFirst 5 rows of our ready-to-train data:")
# print(clean_df.head())
























import pandas as pd
import os
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text

# --- 1. SETUP & CLEANING (What we already did) ---
script_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(script_dir, "adhd200_preprocessed_phenotypics.tsv")

df = pd.read_csv(file_path, sep="\t")

useful_columns = ['Age', 'Gender', 'Inattentive', 'Hyper/Impulsive', 'DX']
clean_df = df[useful_columns].copy()

# Force everything to be a number (turns text like 'pending' into a blank NaN)
for col in useful_columns:
    clean_df[col] = pd.to_numeric(clean_df[col], errors='coerce')

clean_df = clean_df.dropna()
clean_df = clean_df[(clean_df != -999).all(axis=1)]

print(f"Total people ready for training: {clean_df.shape[0]}")

# --- 2. THE AI TRAINING (The new stuff!) ---

# Separate the "Questions" (Features) from the "Answer" (Diagnosis)
X = clean_df[['Age', 'Gender', 'Inattentive', 'Hyper/Impulsive']] # The Questions
y = clean_df['DX']                                                # The Answer (0 or 1)

# Split data: 80% to train the AI, 20% to test if it actually learned anything
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create the Decision Tree AI (max_depth=3 keeps the rules short and simple!)
model = DecisionTreeClassifier(max_depth=3, random_state=42)

# TRAIN IT! (This is where the magic happens)
model.fit(X_train, y_train)

# Check how accurate it is on the 20% test data
accuracy = model.score(X_test, y_test)

print("\n--- AI TRAINING COMPLETE ---")
print(f"Model Accuracy: {accuracy * 100:.1f}%\n")

# Extract and print the actual rules it learned
print("--- THE RULES THE AI LEARNED ---")
rules = export_text(model, feature_names=['Age', 'Gender', 'Inattentive', 'Hyper/Impulsive'])
print(rules)
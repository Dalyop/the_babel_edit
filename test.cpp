/*
 * File: proj1.cpp
 * Project: CMSC 202 Project 1 - Election Vote Counter
 * Author: [Your Name]
 * Date: [Current Date]
 * Description: This program reads votes from a file, tallies them by candidate,
 *              and displays both vote counts and a histogram representation.
 */

// Include libraries - these import tools the program needs
#include <iostream>  // Lets us print to screen and get input (cout, cin)
#include <fstream>   // Lets us read from files
#include <string>    // Lets us work with text
#include <iomanip>   // Lets us format output nicely (like aligning columns)

using namespace std;  // Saves us from typing "std::" before common commands

// Constants - these set limits that never change
const int MAX_CANDIDATES = 5;     // We can handle up to 5 different candidates
const int MAX_VOTES = 1000;       // We can count up to 1000 votes

// Function prototypes - inform the compiler these functions exist and will be defined later
// NOTE: Prototypes are declared before the function is defined
string getFileName();  // Asks the user for a file name
bool loadVotes(string fileName, string candidates[], int voteCounts[], int& numCandidates);  // Reads all votes from file
int findCandidateIndex(string candidates[], int numCandidates, string candidateName);  // Finds which candidate a vote belongs to
string toLower(string str);  // Converts text to lowercase
string toTitle(string str);  // Makes text look like a title (First Letter Capitalized)
void printVoteCounts(string candidates[], int voteCounts[], int numCandidates);  // Shows vote numbers
void printHistogram(string candidates[], int voteCounts[], int numCandidates);  // Shows the star chart

// Main function - this is where the code starts
int main() {
    // Setting up storage using arrays
    string candidates[MAX_CANDIDATES];  // An array (list) to store candidate names
    int voteCounts[MAX_CANDIDATES];     // An array to store how many votes each candidate got
    int numCandidates = 0;              // Tracks how many different candidates we actually have
    
    string fileName;         // Will store the name of the vote file
    bool fileLoaded = false; // A true/false flag to check if the file loaded successfully

    // This loop keeps trying until we successfully load a file
    do {
        fileName = getFileName();  // Ask for a filename
        // Try to load the votes
        fileLoaded = loadVotes(fileName, candidates, voteCounts, numCandidates);

        // If it fails, print an error and exit the program
        if (!fileLoaded) {
            cout << "Failed to open vote file." << endl;
            return 1;  // Exit with error code
        }
    } while (!fileLoaded);  // If it worked, it moves on

    // Once we have the data, show the results in two formats!
    printVoteCounts(candidates, voteCounts, numCandidates);  // The counts format ie (Alice Johnson : 10)
    printHistogram(candidates, voteCounts, numCandidates);   // A histogram (Alice Johnson **********)

    return 0;  // Program finished successfully
}

// Function to get filename from user
// Simple! Ask the user "What file?" and return whatever they type
string getFileName() {
    string fileName;  // Variable to store the filename
    
    cout << "What is the name of the file?" << endl;  // Ask user for filename
    getline(cin, fileName);  // Read entire line (allows spaces in filename)
    
    return fileName;  // Send the filename back to main
}

// Function to load votes from file - this is the brain of the operation or logic
// Reads the file and fills our arrays with candidate names and vote counts
bool loadVotes(string fileName, string candidates[], int voteCounts[], int& numCandidates) {
    // Setting up variables that we will need later:
    ifstream inputFile;      // The file reader
    string voteName;         // Will hold each vote as we read it
    int candidateIndex;      // Tells us which candidate this vote is for

    // Start all vote counts at zero
    for (int i = 0; i < MAX_CANDIDATES; i++) {
        voteCounts[i] = 0;  // Initialize each count to 0
    }

    // Try to open the file. If it doesn't work, return false (meaning "it failed")
    inputFile.open(fileName);
    if (!inputFile.is_open()) {
        return false;  // File couldn't be opened
    }

    // Read the file line by line. Each name in a line is one vote.
    // Continue until we have exhausted all votes or reached our candidate limit
    while (getline(inputFile, voteName) && numCandidates <= MAX_CANDIDATES) {
        // Convert the name to title case so "john smith" becomes "John Smith"
        // This keeps everything consistent
        voteName = toTitle(voteName);

        // Check if we've seen this candidate before
        // Returns their position in the array, or -1 if they're new
        candidateIndex = findCandidateIndex(candidates, numCandidates, voteName);

        // If this is a new candidate (candidateIndex == -1):
        if (candidateIndex == -1) {
            if (numCandidates < MAX_CANDIDATES) {
                candidates[numCandidates] = voteName;  // Add their name to our list
                voteCounts[numCandidates] = 1;         // Set their vote count to 1
                numCandidates++;                        // Increase the total number of candidates
            }
        }
        // If the candidate exists, just add 1 to their vote count!
        else {
            voteCounts[candidateIndex]++;
        }
    }

    inputFile.close();  // Close the file when done
    return true;        // Successfully loaded votes
}

// Function to find a candidate in our array
// This searches through our candidate list and returns their position (or -1 if not found)
int findCandidateIndex(string candidates[], int numCandidates, string candidateName) {
    // Convert the name we're looking for to lowercase
    string lowerCandidateName = toLower(candidateName);
    
    // Check each candidate in the list (also converting to lowercase)
    for (int i = 0; i < numCandidates; i++) {
        // If we find a match, return their position
        // The lowercase conversion makes it case-insensitive, so "ALICE" matches "alice"
        if (toLower(candidates[i]) == lowerCandidateName) {
            return i;  // Found them at position i
        }
    }
    
    // If we check everyone and find no match, return -1 (means "not found")
    return -1;
}

// Function to convert string to lowercase
// Goes through each character and converts uppercase letters to lowercase
string toLower(string str) {
    string result = str;  // Make a copy of the string
    
    // Loop through each character in the string
    for (int i = 0; i < (int)result.length(); i++) {
        // If it's uppercase (A-Z), convert it to lowercase (a-z)
        if (result[i] >= 'A' && result[i] <= 'Z') {
            // The math + ('a' - 'A') shifts the character from uppercase to lowercase in the ASCII table
            result[i] = result[i] + ('a' - 'A');
        }
    }
    
    return result;  // Return the lowercase version
}

// Function to convert string to Title Case (First Letter Of Each Word Capitalized)
// Start by making everything lowercase, then we'll capitalize the right letters
string toTitle(string str) {
    string result = toLower(str);  // First, make everything lowercase
    bool capitalizeNext = true;     // Flag to track when to capitalize
    
    // Smart logic here:
    for (int i = 0; i < (int)result.length(); i++) {
        // When we hit a space, the next letter should be capitalized
        if (result[i] == ' ') {
            capitalizeNext = true;
        }
        // When we hit a letter that should be capitalized, convert it to uppercase
        else if (capitalizeNext && result[i] >= 'a' && result[i] <= 'z') {
            result[i] = result[i] - ('a' - 'A');  // Convert to uppercase
            capitalizeNext = false;  // Reset flag
        }
        // Otherwise, leave it alone
        else {
            capitalizeNext = false;
        }
    }
    
    // This turns "john smith" into "John Smith"!
    return result;
}

// Function to print vote counts in a nice formatted list
// Prints a header, then for each candidate prints their name and vote count
void printVoteCounts(string candidates[], int voteCounts[], int numCandidates) {
    cout << "Vote Counts:" << endl;  // Print header
    
    // For each candidate, print their name (right-aligned in 15 spaces)
    // and their vote count (right-aligned in 2 spaces)
    // This creates neat columns!
    for (int i = 0; i < numCandidates; i++) {
        cout << "      ";  // Indentation (6 spaces)
        cout << setw(15) << right << candidates[i]  // Candidate name, right-aligned in 15 spaces
            << " :   "                               // Separator
            << setw(2) << right << voteCounts[i]    // Vote count, right-aligned in 2 spaces
            << endl;  // New line
    }
}

// Function to print histogram (visual bar chart with stars)
// Creates a visual bar chart with stars - for each candidate, print their name
// Then print a star (*) for each vote they got
// So if Alice got 7 votes, you'll see *******
// This makes it super easy to see who's winning at a glance!
void printHistogram(string candidates[], int voteCounts[], int numCandidates) {
    cout << "Histogram:" << endl;  // Print header
    
    for (int i = 0; i < numCandidates; i++) {
        cout << "      ";  // Indentation (6 spaces)
        cout << setw(15) << right << candidates[i] << " :    ";  // Print candidate name
        
        // Print one star for each vote
        for (int j = 0; j < voteCounts[i]; j++) {
            cout << "*";  // Each star represents one vote
        }
        
        cout << endl;  // Move to next line for next candidate
    }
}
import React from 'react';
import { View, Text } from 'react-native';
import HTML from 'react-native-render-html';

const GetValidationState = (props = {htmlText}) => {
  // Sample HTML content
  const htmlContent = htmlText;

  // Function to handle extracting inner text from HTML
  const extractTextFromHTML = (html) => {
    const document = new DOMParser().parseFromString(html, 'text/html');
    return document.documentElement.textContent;
  };

  // Extracted text from HTML
  const extractedText = extractTextFromHTML(htmlContent);

  return (
    <View>
      {/* Render HTML content */}
      <HTML source={{ html: htmlContent }} />

      {/* Display extracted text */}
      <Text>Extracted Text: {extractedText}</Text>
    </View>
  );
};

export default GetValidationState;

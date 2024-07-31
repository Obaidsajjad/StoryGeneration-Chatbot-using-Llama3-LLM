import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { ChatGroq } from '@langchain/groq';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import axios from 'axios';
// import { GROQ_API_KEY } from '@env';
import { hugging2, Hugging_Api, Hugging_API_url } from './components/Api';
import { HfInference } from "@huggingface/inference";

function App(): React.JSX.Element {
  const data = [
    { label: 'Action', value: 'action' },
    { label: 'Romance', value: 'romance' },
    { label: 'Fantacy', value: 'Fantasy' },
    { label: 'Science Fiction', value: 'Science Fiction' },
  ];

  const [title, setTitle] = useState("")
  const [description, setdescription] = useState("")
  const [words, setwords] = useState(100)
  const [genre, setgenre] = useState("")
  const [responses, setresponse] = useState("")
  const [isFocus, setIsFocus] = useState(false);

  const generate_story = async () => {
    setresponse('')
    let prompt = `Generate Story on ${title} in ${words} words and genre of story is ${genre}. `
    if (description !== "") {
      prompt += `Relate story to this scenario (${description})`
    }
    // console.log(prompt)
   
    try {
      const inference = new HfInference(Hugging_Api);

      for await (const chunk of inference.chatCompletionStream({
        model: "meta-llama/Meta-Llama-3-8B-Instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      })) {
        
        const story = (chunk.choices[0]?.delta?.content || "")
        setresponse((prev) => prev + story)
       
      }
    } catch (error) {
      console.error("Error generating story:", error);
      setresponse("Sorry, I couldn't generate a story at this time.");
    }

  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScrollView style={styles.box}>
          <Text style={{ justifyContent: "center", fontSize: 30, fontWeight: '800', alignSelf: "center", marginTop: 15, color: "black" }}>Story Generator</Text>
          <Text></Text>
          <Text style={{ marginLeft: 15, color: "black" }}>Enter Story Title</Text>
          <TextInput style={{ borderWidth: 2, marginHorizontal: 15, marginTop: 10, borderRadius: 10, color: "black" }} placeholder='Enter prompt here' onChangeText={(text) => setTitle(text)}></TextInput>

          <Text></Text>
          <Text style={{ marginLeft: 15, color: "black" }}>Enter Additional Note (Optional)</Text>
          <TextInput style={{ borderWidth: 2, marginHorizontal: 15, marginTop: 10, borderRadius: 10, color: "black" }} onChangeText={(text) => setdescription(text)} placeholder='Enter prompt here'></TextInput>

          <Text></Text>
          <Text style={{ marginLeft: 15, color: "black", marginBottom: 10 }}>Select Genre</Text>
          <Dropdown
            style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={data}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select item' : '...'}
            searchPlaceholder="Search..."
            value={genre}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setgenre(item.value);
              setIsFocus(false);
            }}

          />

          <Text></Text>
          <Text style={{ marginLeft: 15, color: "black" }}>Select Word Limit</Text>

          <View style={{ flexDirection: "row" }}>
            <Slider style={styles.slider}
              minimumValue={100}
              maximumValue={500}
              step={1}
              value={words}
              onValueChange={(value) => setwords(value)}
              minimumTrackTintColor="#1fb28a"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#b9e4c9" />
            <Text style={{ color: "black", fontWeight: "700" }}>{words}</Text>
          </View>
          <View style={{ marginVertical: 20, marginHorizontal: 15 }}>
            <Button title='Generate' onPress={generate_story} />
          </View>

          {
            responses != "" ? <View style={{ marginHorizontal: 10, borderWidth: 3, borderRadius: 15, padding: 10, marginBottom: 10 }}>
              <Text style={{ justifyContent: "center", fontSize: 25, fontWeight: '600', alignSelf: "center", marginBottom: 5, color: "black" }}>Generated Story</Text>
              <Text style={{ color: "black" }}>{responses}</Text>
            </View> : null
          }

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    padding: 25, backgroundColor: "blue", flex: 1
  },
  box: {
    backgroundColor: "white", borderRadius: 20
  },
  slider: {
    width: '85%',
    height: 30, marginLeft: 10,
    marginTop: 16, shadowColor: "red"
  },
  pickerSelectStyl: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
  pickerIOS: {
    height: 200,
    width: '100%',
  },
  pickerAndroid: {
    height: 50,
    width: '100%', color: "black"
  },

  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8, width: "90%", marginLeft: 15,
    paddingHorizontal: 8, color: "black"
  },
  icon: {
    marginRight: 5, color: "black"
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16, color: "black"
  },
  selectedTextStyle: {
    fontSize: 16, color: "black"
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16, color: "black"
  },

});

export default App;
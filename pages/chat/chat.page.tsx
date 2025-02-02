"worklet";

import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Message as MessageModel } from "../../models/Message";
import {
  Dimensions,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Image,
} from "react-native";
import styled from "styled-components/native";
import { colors } from "../../theme/colors";
import { useEffect, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/api";
import { wait } from "../../utils/wait";
import { Dish } from "../../models/DIsh";
import { Spacer } from "../../components/spacer.component";
import _ from "lodash";

export const ChatPage = ({
  messages,
  setMessages,
  isChatOpen,
  setIsChatOpen,
  cart,
  setCart,
}: {
  messages: MessageModel[];
  setMessages: React.Dispatch<React.SetStateAction<MessageModel[]>>;
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  cart: { image: string; name: string; quantity: number; unit: string }[];
  setCart: React.Dispatch<
    React.SetStateAction<
      { image: string; name: string; quantity: number; unit: string }[]
    >
  >;
}) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const textBoxWidth = useSharedValue(50);
  const backgroundOpacity = useSharedValue(0);
  const messageOpacity = useSharedValue(0);

  useEffect(() => {
    if (!messages.length) {
      setMessages([
        {
          type: "text",
          text: "Hi, Aarush! How can I help you today?",
          sentBy: "bot",
        },
      ]);
    }
  }, [messages]);

  useEffect(() => {
    messageOpacity.set(0);
    messageOpacity.set(withTiming(1, { duration: 500 }));
  }, [messages]);

  useEffect(() => {
    if (isChatOpen) {
      textBoxWidth.value = withTiming(windowWidth - 40, { duration: 250 });
      backgroundOpacity.value = withTiming(1, { duration: 500 });
    } else {
      textBoxWidth.value = withTiming(50, { duration: 250 });
      backgroundOpacity.value = withTiming(0, { duration: 500 });
    }
  }, [isChatOpen, textBoxWidth]);

  const chatInputStyle = useAnimatedStyle(() => {
    "worklet";
    return { width: textBoxWidth.get() };
  });

  const gradientStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      opacity: backgroundOpacity.get(),
      height: "100%",
    };
  });

  const messageStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      opacity: messageOpacity.get(),
    };
  });

  return (
    <KeyboardAvoidingView
      behavior="position"
      style={{
        flex: 1,
        position: "absolute",
        bottom: 0,
        left: 0,
        zIndex: 5,
        width: isChatOpen ? windowWidth : windowWidth,
        height: isChatOpen ? windowHeight : 0,
      }}
    >
      <Animated.ScrollView style={gradientStyle} bounces={false}>
        <Container>
          <SafeAreaView style={{ flex: 1, padding: 20 }}>
            <Messages>
              {messages.map((message, index) => (
                <View
                  style={{ width: "100%" }}
                  key={Math.random().toString(36)}
                >
                  <Message
                    $isUser={message.sentBy === "user"}
                    style={
                      index === messages.length - 1
                        ? messageStyle
                        : { opacity: 1 }
                    }
                  >
                    <MessageText $isUser={message.sentBy === "user"}>
                      {message.text}
                    </MessageText>
                  </Message>

                  {message.type === "dishes" && (
                    <ScrollView
                      style={{
                        width: "100%",
                        maxHeight: 125,
                        paddingLeft: 10,
                        marginTop: 10,
                      }}
                      showsHorizontalScrollIndicator={false}
                      horizontal
                    >
                      {message.dishes!.map((dish, dishIndex) => (
                        <TouchableOpacity
                          disabled={dish.disabled}
                          activeOpacity={0.8}
                          onPress={() => {
                            setIsLoading(true);
                            const newMessages = [...messages];
                            newMessages[index].dishes = [
                              {
                                ...newMessages[index].dishes![dishIndex],
                                disabled: true,
                              },
                            ];
                            setMessages(newMessages);
                            api
                              .post<{ recipe: { instruction: string }[] }>(
                                "/recipe-suggestion",
                                {
                                  name: dish.name,
                                  ingredients: dish.ingredients,
                                }
                              )
                              .then((resp) => {
                                console.log(resp.data);
                                setMessages((messages) => [
                                  ...messages,
                                  {
                                    type: "recipe",
                                    sentBy: "bot",
                                    text: "Here is the recipe: ",
                                    steps: resp.data.recipe,
                                  },
                                ]);
                              })
                              .catch(console.log)
                              .finally(() => setIsLoading(false));
                            api
                              .post("/get-ingredient-info", {
                                ingredients: dish.ingredients,
                              })
                              .then((resp) => {
                                console.log(JSON.stringify(resp.data));
                                setMessages((messages) => [
                                  ...messages,
                                  {
                                    type: "ingredients",
                                    sentBy: "bot",
                                    ingredients: resp.data
                                      .filter((item: any) => !!item)
                                      .map((item: any) => ({
                                        image: item.img,
                                        name: _.capitalize(item.original),
                                        calories:
                                          item.nutrition.nutrients.find(
                                            (nutrient: any) =>
                                              nutrient.title === "Calories"
                                          )?.amount ?? 0,
                                      })),
                                    text: "Here are the ingredients you'll need. Order them?",
                                  },
                                ]);
                              })
                              .catch(console.log);
                          }}
                          key={Math.random().toString(36)}
                        >
                          <Card>
                            <DishName>{dish.name}</DishName>
                            <View>
                              <DishCalories>
                                {dish.nutritionalInfo.calories} cals •{" "}
                                {dish.nutritionalInfo.protein}g protein
                              </DishCalories>
                              <Spacer size={10} direction="bottom" />
                              <View style={{ flexDirection: "row", gap: 5 }}>
                                {dish.keywords?.slice(0, 2)?.map((keyword) => (
                                  <Keyword key={Math.random().toString(36)}>
                                    <KeywordText>
                                      {_.capitalize(keyword)}
                                    </KeywordText>
                                  </Keyword>
                                ))}
                              </View>
                            </View>
                          </Card>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                  {message.type === "recipe" && (
                    <RecipeCard
                      style={{
                        width: windowWidth - 40,
                        marginHorizontal: 20,
                        marginTop: 5,
                        maxHeight: 1000,
                      }}
                    >
                      {message.steps?.map((step, index) => (
                        <Step key={Math.random().toString(36)}>
                          <StepNumber>
                            <StepNumberText>{index + 1}</StepNumberText>
                          </StepNumber>
                          <StepText>
                            {step.instruction?.replace(/[0-9]{1,2}[.] /, "")}
                          </StepText>
                        </Step>
                      ))}
                    </RecipeCard>
                  )}
                  {message.type === "ingredients" && (
                    <>
                      <ScrollView
                        style={{
                          maxHeight: 130,
                          width: "100%",
                          marginTop: 10,
                          marginLeft: 20,
                        }}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        {message.ingredients!.map((item, index) => (
                          <Spacer
                            size={
                              index !== message.ingredients!.length - 1 ? 10 : 0
                            }
                            direction="right"
                            key={Math.random().toString(36)}
                          >
                            <Card style={{ flexDirection: "row", gap: 20 }}>
                              <Image
                                source={{ uri: item.image }}
                                style={{ width: 100, height: 100 }}
                              />
                              <View style={{ alignSelf: "center" }}>
                                <DishName style={{ maxWidth: 100 }}>
                                  {item.name}
                                </DishName>
                                <DishCalories>
                                  {item.calories * Math.random() * 100} cals
                                </DishCalories>
                              </View>
                            </Card>
                          </Spacer>
                        ))}
                      </ScrollView>
                      <AddToCartButton
                        onPress={() => {
                          const products = message.ingredients!.map((item) => ({
                            name: item.name,
                            image: item.image,
                            quantity: 100,
                            unit: "g",
                          }));

                          setCart([...cart, products as any]);
                        }}
                        style={{ marginHorizontal: 20, marginTop: 10 }}
                      >
                        <AddToCartButtonText>Add to cart</AddToCartButtonText>
                      </AddToCartButton>
                    </>
                  )}
                </View>
              ))}

              {isLoading ? (
                <Message>
                  <MessageText>...</MessageText>
                </Message>
              ) : null}
            </Messages>
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 50,
                right: 20,
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
              }}
              onPress={() => isChatOpen && setIsChatOpen(false)}
            >
              <CloseButton>
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.text.withOpacity(0.7).hex}
                />
              </CloseButton>
            </TouchableOpacity>
          </SafeAreaView>
        </Container>
      </Animated.ScrollView>
      <TouchableWithoutFeedback
        onPress={() => !isChatOpen && setIsChatOpen(true)}
      >
        <ChatInput
          $active={isChatOpen}
          style={{
            ...chatInputStyle,
          }}
        >
          <Circle
            style={{
              backgroundColor: !isChatOpen
                ? colors.secondary.hex
                : "transparent",
            }}
          ></Circle>
          <ChatInputText
            placeholder="What would you like..."
            value={message}
            onChange={({
              nativeEvent: { text },
            }: {
              nativeEvent: { text: string };
            }) => setMessage(text)}
            onSubmitEditing={async ({
              nativeEvent: { text },
            }: {
              nativeEvent: { text: string };
            }) => {
              if (!text) return;

              const prompt = messages
                .filter((message) => message.sentBy === "user")
                .map((message) => message.text)
                .join("\n");

              setMessages((messages) => [
                ...messages,
                { type: "text", text, sentBy: "user" },
              ]);

              setIsLoading(true);
              api
                .post<
                  | {
                      dishes: Dish[];
                    }
                  | { standardAnswer: string }
                >("/meal-suggestion", {
                  userPrompt: prompt,
                })
                .then(async (resp) => {
                  console.log("My resp");

                  console.log(resp.data);
                  console.log(typeof resp.data);
                  setMessages((messages) => [
                    ...messages,
                    {
                      type:
                        "dishes" in
                        (typeof resp.data === "string"
                          ? JSON.parse(resp.data)
                          : resp.data)
                          ? "dishes"
                          : "text",
                      text: (resp.data as any).standardAnswer ?? "",
                      dishes: (resp.data as any).dishes,
                      sentBy: "bot",
                    },
                  ]);
                  setMessage("");
                })
                .catch((err) => {
                  console.log(err);
                })
                .finally(() => setIsLoading(false));
            }}
          />
        </ChatInput>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const Container = styled(LinearGradient).attrs({
  colors: ["#AEEA8F", "#6DCC97"],
})`
  width: 100%;
  min-height: ${windowHeight};
`;

const Circle = styled.View`
  width: 30px;
  height: 30px;
  border-radius: 15px;
  border: 3px solid ${colors.primary.hex};
`;

const ChatInput = styled(Animated.View)`
  position: absolute;
  bottom: 80px;
  left: 20px;
  padding: 10px 10px;
  background-color: ${colors.white.hex};
  border-radius: 100px;
  flex-direction: row;
  border: 2px solid
    ${({ $active }: { $active: boolean }) =>
      $active ? colors.primary.hex : "transparent"};
`;

const ChatInputText = styled.TextInput`
  margin-left: 15px;
  flex: 1;
  font-family: "Jost";
`;

const Messages = styled.View`
  flex-direction: column;
  /* justify-content: flex-end; */
  flex: 1;
  padding-top: 60px;
  padding-bottom: 75px;
  align-items: flex-start;
  gap: 10px;
`;

const Message = styled(Animated.View)`
  align-self: ${({ $isUser }: { $isUser: boolean }) =>
    $isUser ? "flex-end" : "flex-start"};
  border-radius: ${({ $isUser }: { $isUser: boolean }) =>
    $isUser ? "100px 0 0 100px" : "0 100px 100px 0"};
  background-color: ${({ $isUser }: { $isUser: boolean }) =>
    $isUser ? colors.secondary.hex : colors.white.hex};
  padding: 10px 15px;
`;

const MessageText = styled.Text`
  font-size: 16px;
  font-family: "Jost";
  color: ${({ $isUser }: { $isUser: boolean }) =>
    $isUser ? colors.white.hex : colors.text.hex};
`;

const CloseButton = styled.View`
  border-radius: 100px;
  background-color: ${colors.white.withOpacity(0.9).hex};
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
`;

const Card = styled.View`
  padding: 10px;
  border-radius: 5px;
  background-color: ${colors.white.hex};
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  justify-content: space-evenly;

  width: 265px;
  height: 125px;
  margin-right: 10px;
`;

const RecipeCard = styled.View`
  padding: 20px;
  border-radius: 5px;
  background-color: ${colors.white.hex};
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  justify-content: flex-end;

  width: 250px;
  margin-right: 10px;
  gap: 10px;
`;

const DishName = styled.Text`
  font-family: "Jost";
  font-size: 18px;
  font-weight: 700;
`;

const DishCalories = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.secondary.hex};
`;

const Keyword = styled.View`
  padding: 5px 10px;
  border-radius: 100px;
  background-color: ${colors.secondary.hex};
`;

const KeywordText = styled.Text`
  color: ${colors.white.hex};
  font-size: 16px;
  font-weight: 600;
`;

const Step = styled.View`
  flex-direction: row;
  width: ${windowWidth - 115}px;
  gap: 15px;
`;

const StepNumber = styled.View`
  width: 25px;
  height: 25px;
  justify-content: center;
  align-items: center;
  border-radius: 12.5px;
  background-color: ${colors.secondary.hex};
`;

const StepNumberText = styled.Text`
  font-size: 16px;
  color: ${colors.white.hex};
  font-weight: 600;
`;

const StepText = styled.Text`
  font-size: 16px;
  font-weight: 400;
  color: ${colors.text.hex};
`;

const AddToCartButton = styled.TouchableOpacity`
  background-color: ${colors.secondary.hex};
  border-radius: 5px;
  padding: 10px 20px;
`;

const AddToCartButtonText = styled.Text`
  font-size: 18px;
  color: #fff;
  text-align: center;
  font-weight: 600;
`;

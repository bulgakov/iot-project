#include <Arduino.h>
#include "Colors.h"
#include "StringHelpers.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <Adafruit_AM2315.h>

// DEVICE CONF
String deviceId = "47FkrVzyHQ";
String webhook_pass = "b7ddb01246c7ce4f0bb3";
String webhook_endpoint = "https://iot.bulgakov.online:3001/api/webhooks/auth";
const char* root_ca= \
"-----BEGIN CERTIFICATE-----\n" \
"MIIDQTCCAimgAwIBAgITBmyfz5m/jAo54vB4ikPmljZbyjANBgkqhkiG9w0BAQsF\n" \
"ADA5MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6\n" \
"b24gUm9vdCBDQSAxMB4XDTE1MDUyNjAwMDAwMFoXDTM4MDExNzAwMDAwMFowOTEL\n" \
"MAkGA1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJv\n" \
"b3QgQ0EgMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALJ4gHHKeNXj\n" \
"ca9HgFB0fW7Y14h29Jlo91ghYPl0hAEvrAIthtOgQ3pOsqTQNroBvo3bSMgHFzZM\n" \
"9O6II8c+6zf1tRn4SWiw3te5djgdYZ6k/oI2peVKVuRF4fn9tBb6dNqcmzU5L/qw\n" \
"IFAGbHrQgLKm+a/sRxmPUDgH3KKHOVj4utWp+UhnMJbulHheb4mjUcAwhmahRWa6\n" \
"VOujw5H5SNz/0egwLX0tdHA114gk957EWW67c4cX8jJGKLhD+rcdqsq08p8kDi1L\n" \
"93FcXmn/6pUCyziKrlA4b9v7LWIbxcceVOF34GfID5yHI9Y/QCB/IIDEgEw+OyQm\n" \
"jgSubJrIqg0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMC\n" \
"AYYwHQYDVR0OBBYEFIQYzIU07LwMlJQuCFmcx7IQTgoIMA0GCSqGSIb3DQEBCwUA\n" \
"A4IBAQCY8jdaQZChGsV2USggNiMOruYou6r4lK5IpDB/G/wkjUu0yKGX9rbxenDI\n" \
"U5PMCCjjmCXPI6T53iHTfIUJrU6adTrCC2qJeHZERxhlbI1Bjjt/msv0tadQ1wUs\n" \
"N+gDS63pYaACbvXy8MWy7Vu33PqUXHeeE6V/Uq2V8viTO96LXFvKWlJbYK8U90vv\n" \
"o/ufQJVtMVT8QtPHRh8jrdkPSHCa2XV4cdFyQzR1bldZwgJcJmApzyMZFo6IQ6XU\n" \
"5MsI+yMRQ+hDKXJioaldXgjUkK642M4UwtBV8ob2xJNDd2ZhwLnoQdeXeGADbkpy\n" \
"rqXRfboQnoZsG4q5WTP468SQvvG5\n" \
"-----END CERTIFICATE-----\n";

// WIFI CONF
const char *wifiSsid = "MYSSID";
const char *wifiPass = "MYSSIDPASSWORD";

// MQTT CONF
const char *mqttServer = "iot.bulgakov.online";
const int mqttPort = 1883;
long mqttLastReconnect = 0;
long *mqttLastSend;
String mqttLastReceivedTopic = "";
String mqttLastReceivedMsg = "";

// JSON
DynamicJsonDocument mqttData(2048);

// WIFI CLIENT
WiFiClient wifiClient;

// MQTT CLIENT
PubSubClient mqttClient(wifiClient);

// HELPERS
StringHelpers strh;
long lastStats = 0;

// PINS
#define PIN_PHOTOCELL   36 // GIOP36 (ADC1_0)
#define PIN_SOIL_SENSOR 39 // GIOP39 (ADC1_3)
#define PIN_RELAY       32 // GIOP32 (ADC1_4)

// SENSORS & ACTUATORS
long lastRead = 0;
float prevTemperature;
float prevHumidity;
const long airValue = 2430; // dry
const long waterValue = 1115; // wet
float prevSoilHumidity;
long prevCdsPcr;
bool relayStatus = false;
bool prevRelayStatus = false;

Adafruit_AM2315 am2315;

// FUNCTIONS DEFINITIONS
void clear();
void wifiSetup();
bool getMqttCredentials();
void mqttLoop();
bool mqttConnect();
void mqttCallback(char *topic, byte *payload, unsigned int length);
void mqttSendData();
void processSensors();
void processActuators();
void processIncomingMsg(String topic, String payload);
void printStats();

void setup()
{
    Serial.begin(921600);
    pinMode(BUILTIN_LED, OUTPUT);
    pinMode(PIN_RELAY, OUTPUT);

    clear();
    wifiSetup();
    mqttClient.setCallback(mqttCallback);

    if (!am2315.begin()) {
        Serial.print(Red + "\n\n         SENSOR AM2315 NOT FOUND!! check wiring & pullups!");
        while (1);
    }
}

void loop()
{
    mqttLoop();

    // delay(5000);
    // serializeJsonPretty(mqttData, Serial);
}

void clear()
{
    Serial.write(27);    // ESC Command
    Serial.print("[2J"); // clear screen command
    Serial.write(27);
    Serial.print("[H"); // cursor to home command
}

void wifiSetup()
{
    Serial.print(underlinePurple + "\n\n\nWiFi Connection: " + fontReset + Purple);
    Serial.println(wifiSsid);

    WiFi.begin(wifiSsid, wifiPass);

    int counter = 0;

    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.print(".");
        delay(500);
        counter++;

        if (counter > 10)
        {
            Serial.print("  ⤵" + fontReset);
            Serial.print(Red + "\n\n         WiFi Connection FAILED ");
            Serial.println(" -> Restarting..." + fontReset);
            delay(2000);
            ESP.restart();
        }
    }

    Serial.println(boldGreen + "\n\n         WiFi Connection SUCCESS " + fontReset);
    Serial.print("\n         IP Address -> ");
    Serial.print(boldBlue);
    Serial.print(WiFi.localIP());
    Serial.println(fontReset);
    Serial.print("  ⤵");
    Serial.print(fontReset);
}

bool getMqttCredentials()
{
    Serial.print(underlinePurple + "\n\n\nGetting MQTT Credentials from WebHook" + fontReset + Purple + "  ⤵");
    delay(1000);
    
    String data = "deviceId=" + deviceId + "&password=" + webhook_pass;
    HTTPClient http;
    if (webhook_endpoint.startsWith("https"))
    {
        http.begin(webhook_endpoint, root_ca);
    } else
    {
        http.begin(webhook_endpoint);
    }
    
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    int resCode = http.POST(data);

    if (resCode < 0)
    {
        Serial.print(boldRed + "\n\n         getMqttCredentials ERROR " + fontReset);
        Serial.print("[" + String(resCode) + "] " + http.errorToString(resCode));
        http.end();
        return false;
    }
    else if (resCode != 200)
    {
        Serial.print(boldRed + "\n\n         getMqttCredentials ERROR " + fontReset + String(resCode));
        http.end();
        return false;
    }
    else
    {
        Serial.print(boldGreen + "\n\n         getMqttCredentials SUCCESS " + fontReset);
        String res = http.getString();

        deserializeJson(mqttData, res);
        http.end();
        delay(1000);

        if (mqttData["status"] != "success")
        {
            Serial.print(boldRed + "\n\n         getMqttCredentials ERROR " + fontReset);
            Serial.print(" [" + mqttData["error"].as<String>() + "] ");
            return false;
        }
        
        return true;
    }
}

void mqttLoop()
{
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.print(Red + "\n\n         WiFi DISCONNECTED!! ");
        Serial.println(" -> Restarting..." + fontReset);
        delay(10000);
        ESP.restart();
    }
    
    if (!mqttClient.connected())
    {
        long now = millis();
        if (now - mqttLastReconnect > 5000)
        {
            mqttLastReconnect = millis();
            if (mqttConnect())
            {
                mqttLastReconnect = 0;
            }
        }
    }
    else
    {
        mqttClient.loop();
        processSensors();
        mqttSendData();
        printStats();
    }
}

bool mqttConnect()
{
    if (!getMqttCredentials())
    {
        Serial.println(boldRed + "\n\n      MQTT CREDENTIALS ERROR \n\n RESTARTING IN 10 SECONDS");
        Serial.println(fontReset);
        delay(10000);
        ESP.restart();
    }
    delete[] mqttLastSend;
    mqttLastSend = new long[mqttData["data"]["variables"].size()];
    for (int i = 0; i < mqttData["data"]["variables"].size(); i++)
    {
        mqttLastSend[i] = 0;
    }
    
    mqttClient.setServer(mqttServer, mqttPort);

    Serial.print(underlinePurple + "\n\n\nMQTT Connect" + fontReset + Purple + "  ⤵");

    String mqttId = "device_" + deviceId + "_" + String(random(0xffff), HEX);
    const char* mqttUsername = mqttData["data"]["username"];
    const char* mqttPassword = mqttData["data"]["password"];
    String mqttTopic = mqttData["data"]["topic"];

    if (mqttClient.connect(mqttId.c_str(), mqttUsername, mqttPassword))
    {
        Serial.print(boldGreen + "\n\n         Mqtt Client Connected!! " + fontReset);
        delay(2000);
        mqttClient.subscribe((mqttTopic + "+/actdata").c_str());
        return true;
    }
    else
    {
        Serial.print(boldRed + "\n\n         Mqtt Client Connection Failed!! " + fontReset);
    }
    return false;
}

void mqttCallback(char *topic, byte *payload, unsigned int length)
{
    if (length > 0)
    {
        String strPayload = "";
        for (int i = 0; i < length; i++)
        {
            strPayload += (char)payload[i];
        }
        strPayload.trim();

        processIncomingMsg(String(topic), strPayload);
    }
}

void mqttSendData()
{
    long now = millis();

    for (int i = 0; i < mqttData["data"]["variables"].size(); i++)
    {
        if (mqttData["data"]["variables"][i]["variableType"] == "output")
        {
            continue;
        }
        
        if (mqttData["data"]["variables"][i]["last"].isNull())
        {
            continue;
        }
        
        int variableFreq = mqttData["data"]["variables"][i]["variableFreq"];

        if (now - mqttLastSend[i] > variableFreq * 1000)
        {
            mqttLastSend[i] = millis();

            String rootTopic = mqttData["data"]["topic"];
            String variable = mqttData["data"]["variables"][i]["variable"];
            String topic = rootTopic + variable + "/sdata";

            String sendData = "";
            serializeJson(mqttData["data"]["variables"][i]["last"], sendData);

            mqttClient.publish(topic.c_str(), sendData.c_str());

            // Stats
            long counter = mqttData["data"]["variables"][i]["counter"];
            counter++;
            mqttData["data"]["variables"][i]["counter"] = counter;
        }
    }
}

void processIncomingMsg(String topic, String message)
{
    mqttLastReceivedTopic = topic;
    mqttLastReceivedMsg = message;

    String variable = strh.split(topic, '/', 2);
    
    for (int i = 0; i < mqttData["data"]["variables"].size(); i++)
    {
        if (mqttData["data"]["variables"][i]["variable"] == variable)
        {
            StaticJsonDocument<256> jsonMessage;
            deserializeJson(jsonMessage, message);
            mqttData["data"]["variables"][i]["last"] = jsonMessage;

            // Stats
            long counter = mqttData["data"]["variables"][i]["counter"];
            counter++;
            mqttData["data"]["variables"][i]["counter"] = counter;
        }
    }

    processActuators();
}

void printStats()
{
    long now = millis();

    if (now - lastStats > 2000)
    {
        lastStats = millis();
        clear();

        Serial.print("\n");
        Serial.print(Purple + "\n╔══════════════════════════╗" + fontReset);
        Serial.print(Purple + "\n║       SYSTEM STATS       ║" + fontReset);
        Serial.print(Purple + "\n╚══════════════════════════╝" + fontReset);
        Serial.print("\n\n");
        Serial.print("\n\n");

        Serial.print(boldCyan + "#" + " \t Name" + " \t\t Var" + " \t\t Type" + " \t\t Count" + " \t\t Last V" + fontReset + "\n\n");

        for (int i = 0; i < mqttData["data"]["variables"].size(); i++)
        {

            String variableName = mqttData["data"]["variables"][i]["variableName"];
            String variable     = mqttData["data"]["variables"][i]["variable"];
            String variableType = mqttData["data"]["variables"][i]["variableType"];
            String lastMsg      = mqttData["data"]["variables"][i]["last"];
            long counter        = mqttData["data"]["variables"][i]["counter"];

            Serial.println(String(i) + " \t " + variableName.substring(0, 5) + " \t\t " + variable.substring(0, 10) + " \t " + variableType.substring(0, 5) + " \t\t " + String(counter).substring(0, 10) + " \t\t " + lastMsg);
        }

        Serial.print(boldGreen + "\n\n Free RAM -> " + fontReset + ESP.getFreeHeap() + " Bytes");

        Serial.print(boldGreen + "\n\n Last Incomming Msg -> " + fontReset + mqttLastReceivedMsg);
    }
}

void processSensors()
{
    // get Temperature
    // get Humidity
    float temperature, humidity;

    delay(2000); // CANT READ IN LESS THAN 2SEC
    if (!am2315.readTemperatureAndHumidity(&temperature, &humidity))
    {
        Serial.print(Red + "\n\n         SENSOR AM2315 READ FAILED!! check wiring & pullups!");
        return; // EVAL THIS!!
    }

    // get Soil Humidity
    long soilSensor = analogRead(PIN_SOIL_SENSOR);
    long soilHumidity = map(soilSensor, airValue, waterValue, 0, 100);

    // get Photoresistor
    long cdsValue = analogRead(PIN_PHOTOCELL); //value between 0 and 4095
    long cdsPcr = map(cdsValue, 0, 4095, 0, 100); //value between 0 and 4095

    // store Data
    mqttData["data"]["variables"][0]["last"]["value"] = temperature;
    mqttData["data"]["variables"][1]["last"]["value"] = humidity;
    mqttData["data"]["variables"][2]["last"]["value"] = soilHumidity;
    mqttData["data"]["variables"][3]["last"]["value"] = cdsPcr;
    mqttData["data"]["variables"][4]["last"]["value"] = relayStatus;

    mqttData["data"]["variables"][0]["last"]["save"] = 0;
    mqttData["data"]["variables"][1]["last"]["save"] = 0;
    mqttData["data"]["variables"][2]["last"]["save"] = 0;
    mqttData["data"]["variables"][3]["last"]["save"] = 0;
    mqttData["data"]["variables"][4]["last"]["save"] = 0;

    if (temperature != prevTemperature)
    {
        mqttData["data"]["variables"][0]["last"]["save"] = 1;
    }

    if (humidity != prevHumidity)
    {
        mqttData["data"]["variables"][1]["last"]["save"] = 1;
    }
    
    if (soilHumidity != prevSoilHumidity)
    {
        mqttData["data"]["variables"][2]["last"]["save"] = 1;
    }
    
    if (cdsPcr != prevCdsPcr)
    {
        mqttData["data"]["variables"][3]["last"]["save"] = 1;
    }

    if (relayStatus != prevRelayStatus)
    {
        mqttData["data"]["variables"][4]["last"]["save"] = 1;
    }

    prevTemperature = temperature;
    prevHumidity = humidity;
    prevSoilHumidity = soilHumidity;
    prevCdsPcr = cdsPcr;
    prevRelayStatus = relayStatus;

    // activate Actuators
    // THIS IS DONE REMOTELY WITH ALARMS
    // if (soilHumidity <= 60 && !relayStatus)
    // {
    //     mqttData["data"]["variables"][5]["last"]["value"] = true;
    //     mqttData["data"]["variables"][5]["last"]["save"] = 1;
        
    //     relayStatus = true;
    //     digitalWrite(PIN_RELAY, HIGH);
    // }

    // if (soilHumidity >= 70 && relayStatus)
    // {
    //     mqttData["data"]["variables"][5]["last"]["value"] = false;
    //     mqttData["data"]["variables"][5]["last"]["save"] = 1;

    //     relayStatus = false;
    //     digitalWrite(PIN_RELAY, LOW);
    // }
}

void processActuators()
{
    // set Relay
    bool newStatus = mqttData["data"]["variables"][5]["last"]["value"];
    if (relayStatus != newStatus)
    {
        if (newStatus)
        {
            digitalWrite(PIN_RELAY, HIGH);
            relayStatus = newStatus;
        } else
        {
            digitalWrite(PIN_RELAY, LOW);
            relayStatus = newStatus;
        }
    }
}

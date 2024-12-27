'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { YearSlider } from "@/components/YearSlider"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { AlertCircle, ThumbsUp } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { historicalNoiseData, getHistoricalData, getLocationData, predictFutureNoise } from '@/app/data/historicalNoiseData'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
}

// New data sheet readings
const newDataSheetReadings = [
  { date: '2024-10-18', locations: [
    { name: 'Kuber Complex', morning: 77.8, afternoon: 84.4, evening: 91.3 },
    { name: 'Bikaneri', morning: 71.2, afternoon: 74.8, evening: 81.7 },
    { name: 'Devisha Road', morning: 71.9, afternoon: 79.6, evening: 85.2 },
    { name: 'Old Palghar Road', morning: 69.7, afternoon: 80.8, evening: 85.7 },
    { name: 'Relief Hospital', morning: 70.1, afternoon: 72.8, evening: 80.7 },
    { name: 'Aurochema', morning: 60.1, afternoon: 78.9, evening: 89.7 },
    { name: 'Dhawale Hospital', morning: 71.1, afternoon: 68.7, evening: 71.2 },
    { name: 'Collector Office', morning: 69.7, afternoon: 75.7, evening: 80.1 },
    { name: 'Pruthvi Complex', morning: 67.6, afternoon: 78.9, evening: 73.1 },
    { name: 'Crystal Park', morning: 70.2, afternoon: 75.5, evening: 80.4 },
    { name: 'Arogyam Hospital', morning: 72.2, afternoon: 78.9, evening: 73.1 },
    { name: 'Philia Hospital', morning: 69.7, afternoon: 70.1, evening: 80.4 },
    { name: 'Korten', morning: 70.2, afternoon: 71.5, evening: 72.7 },
    { name: 'Ghodalal Complex', morning: 72.2, afternoon: 75.7, evening: 79.9 },
    { name: 'Prientenia', morning: 69.7, afternoon: 79.9, evening: 80.1 },
    { name: 'Pruthvi Anand', morning: 71.1, afternoon: 79.8, evening: 74.1 },
    { name: 'Nandore', morning: 68.0, afternoon: 75.9, evening: 77.5 },
    { name: 'Kacheri Road', morning: 75.7, afternoon: 73.5, evening: 79.7 },
    { name: 'Woodern Mill', morning: 70.2, afternoon: 78.9, evening: 88.9 },
    { name: 'Naval Nagar', morning: 70.1, afternoon: 77.5, evening: 80.1 },
    { name: 'Shivaji Chowk', morning: 71.2, afternoon: 78.9, evening: 89.7 },
    { name: 'Ambedkar Chawk', morning: 78.1, afternoon: 92.3, evening: 96.1 },
    { name: 'Valan Naka', morning: 69.7, afternoon: 75.1, evening: 80.7 },
    { name: 'ICCI Bank', morning: 71.7, afternoon: 80.3, evening: 88.5 },
    { name: 'SBI Bank', morning: 69.7, afternoon: 83.2, evening: 79.3 },
    { name: 'Panch Batti', morning: 77.2, afternoon: 88.5, evening: 98.2 },
    { name: 'Railway Station', morning: 79.8, afternoon: 88.9, evening: 95.4 },
  ]},
  // Add more dates here...
]

export default function AnalysisForecastPage() {
  const [yearRange, setYearRange] = useState([1990, 2024])
  const [selectedLocations, setSelectedLocations] = useState(["Kuber Complex", "Railway Station"])
  const [urbanGrowth, setUrbanGrowth] = useState(50)
  const [trafficDensity, setTrafficDensity] = useState(50)
  const [industrialActivity, setIndustrialActivity] = useState(50)
  const [greenSpaces, setGreenSpaces] = useState(50)
  const [noisePolicies, setNoisePolicies] = useState(50)
  const [userFeedback, setUserFeedback] = useState('')
  const [customReadings, setCustomReadings] = useState([
    { year: 2026, reading: '' },
    { year: 2027, reading: '' },
    { year: 2028, reading: '' },
    { year: 2029, reading: '' },
    { year: 2030, reading: '' },
  ])

  const [historicalData, setHistoricalData] = useState([])
  const [forecastData, setForecastData] = useState([])

  useEffect(() => {
    const allLocationData = selectedLocations.map(location => {
      const locationData = getLocationData(location).filter(data => data.year >= yearRange[0] && data.year <= yearRange[1])
      
      // Add new data sheet readings
      newDataSheetReadings.forEach(dayData => {
        const locationReading = dayData.locations.find(loc => loc.name === location)
        if (locationReading) {
          const averageNoise = (locationReading.morning + locationReading.afternoon + locationReading.evening) / 3
          locationData.push({
            year: new Date(dayData.date).getFullYear(),
            averageNoise: averageNoise,
            ...locationReading
          })
        }
      })

      return locationData.sort((a, b) => a.year - b.year)
    })
    setHistoricalData(allLocationData)

    const futurePredictions = selectedLocations.map(location => 
      [1, 2, 3, 4, 5].map(yearOffset => {
        const predictedYear = 2025 + yearOffset
        const customReading = customReadings.find(r => r.year === predictedYear)?.reading
        const predictedNoise = customReading ? parseFloat(customReading) : predictFutureNoise(
          location,
          predictedYear,
          urbanGrowth,
          trafficDensity,
          industrialActivity,
          greenSpaces,
          noisePolicies
        )
        return { year: predictedYear, [location]: predictedNoise }
      })
    )
    setForecastData(futurePredictions)
  }, [selectedLocations, yearRange, urbanGrowth, trafficDensity, industrialActivity, greenSpaces, noisePolicies, customReadings])

  const handleYearRangeChange = (newRange) => {
    setYearRange(newRange)
  }

  const handleLocationChange = (locations: string[]) => {
    setSelectedLocations(locations.slice(0, 3)); // Limit to 3 selections
  };

  const handleCustomReadingChange = (index, value) => {
    const newReadings = [...customReadings]
    newReadings[index].reading = value
    setCustomReadings(newReadings)
  }

  const locations = [...new Set([...historicalNoiseData.flatMap(year => year.locations.map(loc => loc.name)), ...newDataSheetReadings[0].locations.map(loc => loc.name)])]

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="container mx-auto px-4 py-8 space-y-8"
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Noise Pollution Analysis and Forecasting</h1>
        <p className="text-xl">Explore historical trends, predict future levels, and discover ways to reduce noise pollution in Palghar.</p>
      </div>

      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="comparison">Historical Comparison</TabsTrigger>
          <TabsTrigger value="prediction">Future Prediction</TabsTrigger>
          <TabsTrigger value="measures">Remedial Measures</TabsTrigger>
          <TabsTrigger value="feedback">User Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Comparison of Noise Pollution Over the Years</CardTitle>
              <CardDescription>Adjust the slider to view noise pollution levels for different years and locations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Year Range: {yearRange[0]} - {yearRange[1]}</Label>
                <YearSlider
                  min={1990}
                  max={2024}
                  step={1}
                  value={yearRange}
                  onValueChange={handleYearRangeChange}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Locations (select up to 3)</Label>
                <Select 
                  onValueChange={(value) => handleLocationChange(Array.isArray(value) ? value : [value])}
                  multiple
                  maxValues={3}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select locations" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2">
                  <p>Selected locations: {selectedLocations.join(', ')}</p>
                </div>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" allowDuplicatedCategory={false} />
                    <YAxis label={{ value: 'Noise Level (dB)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    {historicalData.map((locationData, index) => (
                      <Line 
                        key={`line-${selectedLocations[index]}`} 
                        data={locationData} 
                        type="monotone" 
                        dataKey="averageNoise" 
                        name={selectedLocations[index]} 
                        stroke={`hsl(${index * 120}, 70%, 50%)`} 
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Historical Analysis:</h3>
                {selectedLocations.map((location, index) => {
                  const locationData = historicalData[index] || []
                  const firstReading = locationData[0]
                  const lastReading = locationData[locationData.length - 1]
                  return (
                    <div key={`analysis-${location}`}>
                      <p>In {location}:</p>
                      <ul className="list-disc pl-5 mt-2">
                        <li>In {yearRange[0]}, the average noise level was {firstReading?.averageNoise ? firstReading.averageNoise.toFixed(1) : 'N/A'} dB</li>
                        <li>By {yearRange[1]}, it reached {lastReading?.averageNoise ? lastReading.averageNoise.toFixed(1) : 'N/A'} dB</li>
                        <li>This represents a change of {firstReading?.averageNoise && lastReading?.averageNoise ? (lastReading.averageNoise - firstReading.averageNoise).toFixed(1) : 'N/A'} dB over {yearRange[1] - yearRange[0]} years</li>
                      </ul>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prediction">
          <Card>
            <CardHeader>
              <CardTitle>Future Noise Pollution Prediction</CardTitle>
              <CardDescription>Adjust variables to simulate future noise pollution levels in selected locations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Urban Growth</Label>
                <Slider
                  value={[urbanGrowth]}
                  onValueChange={(value) => setUrbanGrowth(value[0])}
                  max={100}
                  step={1}
                />
                <p className="text-sm text-muted-foreground">Current: {urbanGrowth}%</p>
              </div>
              <div className="space-y-2">
                <Label>Traffic Density</Label>
                <Slider
                  value={[trafficDensity]}
                  onValueChange={(value) => setTrafficDensity(value[0])}
                  max={100}
                  step={1}
                />
                <p className="text-sm text-muted-foreground">Current: {trafficDensity}%</p>
              </div>
              <div className="space-y-2">
                <Label>Industrial Activity</Label>
                <Slider
                  value={[industrialActivity]}
                  onValueChange={(value) => setIndustrialActivity(value[0])}
                  max={100}
                  step={1}
                />
                <p className="text-sm text-muted-foreground">Current: {industrialActivity}%</p>
              </div>
              <div className="space-y-2">
                <Label>Green Spaces</Label>
                <Slider
                  value={[greenSpaces]}
                  onValueChange={(value) => setGreenSpaces(value[0])}
                  max={100}
                  step={1}
                />
                <p className="text-sm text-muted-foreground">Current: {greenSpaces}%</p>
              </div>
              <div className="space-y-2">
                <Label>Noise Reduction Policies</Label>
                <Slider
                  value={[noisePolicies]}
                  onValueChange={(value) => setNoisePolicies(value[0])}
                  max={100}
                  step={1}
                />
                <p className="text-sm text-muted-foreground">Current: {noisePolicies}%</p>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Prediction Methodology</AlertTitle>
                <AlertDescription>
                  Our predictions are based on historical data and use a combination of time series analysis and machine learning models. 
                  The model takes into account urban growth patterns, traffic density changes, industrial activity fluctuations, green space development, 
                  and the implementation of noise reduction policies to forecast future noise pollution levels.
                </AlertDescription>
              </Alert>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" allowDuplicatedCategory={false} />
                    <YAxis label={{ value: 'Predicted Noise Level (dB)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    {forecastData.map((locationData, index) => (
                      <Area 
                        key={`area-${selectedLocations[index]}`} 
                        type="monotone" 
                        dataKey={selectedLocations[index]} 
                        data={locationData}
                        name={selectedLocations[index]} 
                        fill={`hsl(${index * 120}, 70%, 50%)`} 
                        stroke={`hsl(${index * 120}, 70%, 50%)`} 
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Prediction Analysis:</h3>
                {selectedLocations.map((location, index) => {
                  const locationForecast = forecastData[index] || []
                  const firstPrediction = locationForecast[0]
                  const lastPrediction = locationForecast[locationForecast.length - 1]
                  return (
                    <div key={`prediction-${location}`}>
                      <p>For {location}, the model predicts:</p>
                      <ul className="list-disc pl-5 mt-2">
                        <li>An average increase of {firstPrediction && lastPrediction && firstPrediction[location] && lastPrediction[location] ? ((lastPrediction[location] - firstPrediction[location]) / 5).toFixed(1) : 'N/A'} dB per year</li>
                        <li>By {lastPrediction?.year || 'N/A'}, the average noise level could reach {lastPrediction && lastPrediction[location] ? lastPrediction[location].toFixed(1) : 'N/A'} dB</li>
                      </ul>
                    </div>
                  )
                })}
                <p>The most significant factor contributing to these changes is {
                  ['Urban Growth', 'Traffic Density', 'Industrial Activity', 'Green Spaces', 'Noise Reduction Policies']
                  [Math.max(urbanGrowth, trafficDensity, industrialActivity, 100 - greenSpaces, 100 - noisePolicies) === urbanGrowth ? 0 :
                   Math.max(urbanGrowth, trafficDensity, industrialActivity, 100 - greenSpaces, 100 - noisePolicies) === trafficDensity ? 1 :
                   Math.max(urbanGrowth, trafficDensity, industrialActivity, 100 - greenSpaces, 100 - noisePolicies) === industrialActivity ? 2 :
                   Math.max(urbanGrowth, trafficDensity, industrialActivity, 100 - greenSpaces, 100 - noisePolicies) === 100 - greenSpaces ? 3 : 4]
                }</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measures">
          <Card>
            <CardHeader>
              <CardTitle>Suggestions and Remedial Measures</CardTitle>
              <CardDescription>Actionable steps to reduce noise pollution in Palghar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-semibold">For Residential Areas:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Install soundproof windows and doors</li>
                    <li>Plant trees and create green barriers</li>
                    <li>Implement and respect quiet hours</li>
                    <li>Use noise-absorbing materials in home construction</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">For Commercial Areas:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Use noise-absorbing materials in construction</li>
                    <li>Regulate delivery times to reduce nighttime noise</li>
                    <li>Encourage the use of electric vehicles for deliveries</li>
                    <li>Install sound barriers around noisy equipment</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">For Industrial Areas:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Install noise barriers around industrial sites</li>
                    <li>Use quieter machinery and equipment</li>
                    <li>Implement regular maintenance to reduce equipment noise</li>
                    <li>Create buffer zones between industrial and residential areas</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">General Measures:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Enforce stricter noise regulations</li>
                    <li>Promote public awareness about noise pollution</li>
                    <li>Invest in smart city technologies for noise monitoring</li>
                    <li>Encourage the use of public transportation</li>
                  </ul>
                </div>
              </div>
              <Alert className="bg-green-50 border-green-200">
                <ThumbsUp className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success Story</AlertTitle>
                <AlertDescription className="text-green-700">
                  The city of Mumbai has successfully reduced noise pollution in some areas by up to 8 dB by implementing 
                  low-noise road surfaces, creating quiet zones, and promoting electric public transportation.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>User Feedback</CardTitle>
              <CardDescription>Share your thoughts or report noise concerns in Palghar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback">Your Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="Type your feedback or concerns here..."
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                />
              </div>
              <Button onClick={() => {
                // Here you would typically send the feedback to a server
                alert('Thank you for your feedback! We will use this information to improve our noise pollution mitigation efforts in Palghar.')
                setUserFeedback('')
              }}>
                Submit Feedback
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}


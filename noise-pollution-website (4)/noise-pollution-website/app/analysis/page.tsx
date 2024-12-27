'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download } from 'lucide-react'
import { noiseData } from '../data/noiseData'
import dynamic from 'next/dynamic'

const NoiseChart = dynamic(() => import('@/components/NoiseChart'), { ssr: false })
const NoiseMap = dynamic(() => import('@/components/NoiseMap'), { ssr: false })

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
}

export default function AnalysisPage() {
  const [selectedLocation, setSelectedLocation] = useState(noiseData[0].name)
  const [dateRange, setDateRange] = useState([noiseData[0].date, noiseData[noiseData.length - 1].date])
  const [noiseThreshold, setNoiseThreshold] = useState(70)
  const [analysisType, setAnalysisType] = useState('time')
  const [mapData, setMapData] = useState(noiseData)

  const locations = Array.from(new Set(noiseData.map(item => item.name)))

  useEffect(() => {
    const filteredData = noiseData.filter(item => 
      item.name === selectedLocation &&
      new Date(item.date) >= new Date(dateRange[0]) &&
      new Date(item.date) <= new Date(dateRange[1])
    )
    setMapData(filteredData)
  }, [selectedLocation, dateRange])

  const handleThresholdChange = (value: number[]) => {
    setNoiseThreshold(value[0])
    const newMapData = noiseData.map(item => ({
      ...item,
      isAboveThreshold: (item.morning + item.afternoon + item.evening) / 3 > value[0]
    }))
    setMapData(newMapData)
  }

  const downloadData = () => {
    const headers = ['Location', 'Type', 'Date', 'Morning', 'Afternoon', 'Evening', 'Average']
    const csvData = [
      headers.join(','),
      ...mapData.map(item => {
        const avg = ((item.morning + item.afternoon + item.evening) / 3).toFixed(1)
        return [
          item.name,
          item.type,
          item.date,
          item.morning,
          item.afternoon,
          item.evening,
          avg
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `noise-analysis-${selectedLocation}-${dateRange[0]}-${dateRange[1]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="container mx-auto px-4 py-8"
    >
      <div className="bg-city-contrast bg-cover bg-center bg-overlay relative p-8 rounded-lg mb-8">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white">Noise Pollution Analysis</h1>
          <p className="text-white/80 mt-2">Analyze and visualize noise pollution data across different locations</p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Analysis Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Select onValueChange={setSelectedLocation} defaultValue={selectedLocation}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateRange[0]}
              onChange={(e) => setDateRange([e.target.value, dateRange[1]])}
            />
            <Input
              type="date"
              value={dateRange[1]}
              onChange={(e) => setDateRange([dateRange[0], e.target.value])}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="noise-threshold" className="text-sm font-medium">
              Noise Threshold: {noiseThreshold} dB
            </label>
            <Slider
              id="noise-threshold"
              min={0}
              max={120}
              step={1}
              value={[noiseThreshold]}
              onValueChange={handleThresholdChange}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mb-4">
        <Button onClick={downloadData} className="gap-2">
          <Download className="h-4 w-4" />
          Download Analysis Data
        </Button>
      </div>

      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart">Chart Analysis</TabsTrigger>
          <TabsTrigger value="map">Map Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Noise Level Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    variant={analysisType === 'time' ? 'default' : 'outline'}
                    onClick={() => setAnalysisType('time')}
                  >
                    Time Series
                  </Button>
                  <Button
                    variant={analysisType === 'distribution' ? 'default' : 'outline'}
                    onClick={() => setAnalysisType('distribution')}
                  >
                    Distribution
                  </Button>
                </div>
                <NoiseChart
                  data={mapData}
                  location={selectedLocation}
                  analysisType={analysisType}
                  threshold={noiseThreshold}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Noise Pollution Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <NoiseMap data={mapData} threshold={noiseThreshold} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}


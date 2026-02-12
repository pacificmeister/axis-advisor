#!/usr/bin/env node

/**
 * Wizard Test Matrix Validator
 * 
 * Validates wizard recommendation logic against expert-defined test cases.
 * Run before deployment to catch logic errors.
 * 
 * Usage: node tests/validate-wizard.js
 */

const fs = require('fs');
const path = require('path');

// Load test matrix
const testMatrix = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'wizard-test-matrix.json'), 'utf8')
);

// Load product data
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../public/data/axis-products.json'), 'utf8')
);
const products = productsData.collections['front-wings'].products.map(p => ({
  id: p.id,
  title: p.title,
  specs: p.specs,
  description: p.description
}));

// Wizard logic (extracted from page.tsx)
function getRecommendations(inputWeight, weightUnit, skillLevel, useCase) {
  const weight = weightUnit === 'kg' ? Math.round(inputWeight * 2.20462) : inputWeight;
  
  // Calculate ideal area
  let baseArea = weight * 6;
  
  if (useCase === 'parawing') {
    if (skillLevel === 'beginner') baseArea *= 1.0;
    else if (skillLevel === 'intermediate') baseArea *= 0.92;
    else if (skillLevel === 'advanced') baseArea *= 0.9;
  } else {
    if (skillLevel === 'beginner') baseArea *= 1.3;
    else if (skillLevel === 'intermediate') baseArea *= 1.0;
    else if (skillLevel === 'advanced') baseArea *= 0.8;
  }
  
  const disciplineAdjustments = {
    wing: 1.0,
    kite: 0.9,
    prone: 0.85,
    sup: 1.2,
    downwind: 1.3,
    pump: 1.4,
  };
  if (useCase !== 'parawing') {
    baseArea *= disciplineAdjustments[useCase] || 1.0;
  }
  
  // Series preferences
  const disciplineSeries = {
    wing: skillLevel === 'beginner' 
      ? ['Surge', 'BSC'] 
      : skillLevel === 'intermediate' 
        ? ['Surge', 'ART v2', 'Fireball'] 
        : ['Tempo', 'Spitfire', 'ART v2', 'Fireball'],
    parawing: skillLevel === 'beginner' 
      ? ['PNG V2', 'Surge', 'Tempo'] 
      : skillLevel === 'intermediate' 
        ? ['Fireball', 'ART v2', 'Surge', 'PNG V2'] 
        : ['Fireball', 'Tempo', 'ART v2', 'Spitfire'],
    kite: skillLevel === 'beginner' 
      ? ['Surge', 'Tempo'] 
      : ['Spitfire', 'ART v2', 'PNG V2', 'Fireball'],
    prone: ['Surge', 'Fireball', 'Tempo'],
    sup: ['PNG V2', 'Surge', 'Tempo'],
    downwind: ['PNG V2', 'Surge', 'ART v2', 'Tempo'],
    pump: ['PNG V2', 'Tempo', 'Surge'],
  };
  
  const preferredSeries = disciplineSeries[useCase] || [];
  const currentSeries = ['Surge', 'Tempo', 'ART v2', 'Fireball', 'PNG V2', 'Spitfire'];
  const currentProducts = products.filter(p => {
    const series = p.specs.series;
    const effectiveSeries = series === 'PNG' && p.title.includes('V2') ? 'PNG V2' : series;
    return currentSeries.includes(effectiveSeries);
  });
  
  // Score products
  const scored = currentProducts.map(product => {
    let score = 100;
    const area = product.specs.area;
    const series = product.specs.series;
    const effectiveSeries = series === 'PNG' && product.title.includes('V2') ? 'PNG V2' : series;
    
    // Series match
    if (!preferredSeries.includes(effectiveSeries)) {
      score -= skillLevel === 'advanced' ? 70 : 50;
    } else {
      const seriesIndex = preferredSeries.indexOf(effectiveSeries);
      score += (5 - seriesIndex * 2);
    }
    
    // Area match
    const areaDiff = Math.abs(area - baseArea);
    const areaPercent = areaDiff / baseArea;
    
    if (areaPercent < 0.1) score += 20;
    else if (areaPercent < 0.2) score += 10;
    else if (areaPercent < 0.3) score += 0;
    else if (areaPercent < 0.5) score -= 15;
    else score -= 35;
    
    // Safety penalties
    if (skillLevel === 'beginner' && area < baseArea * 0.8) score -= 30;
    if (skillLevel === 'advanced' && area > baseArea * 1.3) score -= 20;
    
    // Aspect Ratio scoring
    const ar = product.specs.aspectRatio;
    if (ar) {
      if (skillLevel === 'beginner') {
        if (ar > 12) score -= 25;
        else if (ar > 10) score -= 10;
        else if (ar < 9) score += 5;
      } else if (skillLevel === 'intermediate') {
        if (ar > 14) score -= 15;
        else if (ar > 12) score -= 5;
        else if (ar >= 9 && ar <= 11) score += 5;
      } else if (skillLevel === 'advanced') {
        if (ar < 8) score -= 10;
        else if (ar > 10) score += 5;
      }
    }
    
    return {
      product,
      score,
      area,
      series: effectiveSeries,
      ar: ar || null,
      idealArea: baseArea
    };
  });
  
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}

// Validation functions
function validateTestCase(testCase) {
  const { input, expected } = testCase;
  const results = getRecommendations(
    input.weight,
    input.weightUnit,
    input.skillLevel,
    input.useCase
  );
  
  const issues = [];
  
  // Check ideal area calculation
  const actualIdealArea = Math.round(results[0].idealArea);
  const expectedIdealArea = expected.idealArea;
  if (Math.abs(actualIdealArea - expectedIdealArea) > 10) {
    issues.push(`Ideal area mismatch: expected ${expectedIdealArea}, got ${actualIdealArea}`);
  }
  
  // Check top recommendations series
  const topSeries = results.slice(0, 3).map(r => r.series);
  const expectedSeries = expected.topRecommendations.map(r => r.series);
  const hasExpectedSeries = expectedSeries.some(s => topSeries.includes(s));
  if (!hasExpectedSeries) {
    issues.push(`None of expected series ${expectedSeries.join(', ')} in top 3: ${topSeries.join(', ')}`);
  }
  
  // Check "should not recommend" items
  if (expected.shouldNotRecommend) {
    expected.shouldNotRecommend.forEach(badRec => {
      const foundBad = results.slice(0, 3).find(r => 
        r.series === badRec.series && 
        (!badRec.area || r.area === badRec.area)
      );
      if (foundBad) {
        issues.push(`SHOULD NOT recommend ${badRec.series} ${badRec.area || ''}: ${badRec.reason}`);
      }
    });
  }
  
  return {
    passed: issues.length === 0,
    issues,
    actualTop3: results.slice(0, 3).map(r => ({
      series: r.series,
      area: r.area,
      ar: r.ar,
      score: r.score
    })),
    idealArea: actualIdealArea
  };
}

// Run all tests
console.log('🧪 Running Wizard Test Matrix Validation\n');
console.log(`Loaded ${testMatrix.test_cases.length} test cases\n`);

let passCount = 0;
let failCount = 0;

testMatrix.test_cases.forEach(testCase => {
  const result = validateTestCase(testCase);
  
  if (result.passed) {
    console.log(`✅ PASS: ${testCase.name}`);
    console.log(`   Ideal area: ${result.idealArea} cm²`);
    console.log(`   Top 3: ${result.actualTop3.map(r => `${r.series} ${r.area}${r.ar ? ` (AR:${r.ar})` : ''}`).join(', ')}\n`);
    passCount++;
  } else {
    console.log(`❌ FAIL: ${testCase.name}`);
    console.log(`   Ideal area: ${result.idealArea} cm²`);
    console.log(`   Top 3: ${result.actualTop3.map(r => `${r.series} ${r.area}${r.ar ? ` AR:${r.ar}` : ''} (score: ${r.score})`).join(', ')}`);
    console.log(`   Issues:`);
    result.issues.forEach(issue => console.log(`     - ${issue}`));
    console.log('');
    failCount++;
  }
});

console.log('─'.repeat(60));
console.log(`Results: ${passCount} passed, ${failCount} failed`);

if (failCount > 0) {
  console.log('\n⚠️  Some tests failed. Review logic before deploying.\n');
  process.exit(1);
} else {
  console.log('\n✨ All tests passed! Safe to deploy.\n');
  process.exit(0);
}

const assert = require('node:assert');
const { AIOrchestrator } = require('../src/ai/ai-orchestrator');
const usageService = require('../src/services/usage-service');

async function runTests() {
  console.log('🧪 Starting DEARLY Unit & Service Tests...');

  const orchestrator = new AIOrchestrator();

  // Test 1: Photo Analysis
  console.log('Test 1: Photo atmosphere analysis...');
  const analysis1 = await orchestrator.analyzePhoto({ description: 'cheerful grandchild running in sunny park' });
  assert.strictEqual(analysis1.recommendedTemplate, 'Warm');
  assert.ok(analysis1.detectedSubjects.includes('grandchild'));
  console.log('✓ Photo analysis passed:', analysis1.scene, analysis1.vibe);

  // Test 2: "I don't know what to say" handling
  console.log('Test 2: "I don\'t know what to say" intention handling...');
  const messagesUndecided = await orchestrator.generateMessageCandidates({
    intention: "I don't know what to say",
    recipient: 'Grandchild',
    mood: 'Loving'
  });
  assert.strictEqual(messagesUndecided.length, 3);
  assert.ok(messagesUndecided[0].text.length > 10);
  assert.ok(messagesUndecided[0].text.includes('❤️'));
  console.log('✓ "I don\'t know what to say" passed. Candidate sample:', messagesUndecided[0].text);

  // Test 3: Specific intention synthesis
  console.log('Test 3: Tailored message generation...');
  const birthdayMessages = await orchestrator.generateMessageCandidates({
    intention: "Happy birthday Maya",
    recipient: "Child",
    mood: "Happy"
  });
  assert.strictEqual(birthdayMessages.length, 3);
  assert.ok(birthdayMessages[0].text.toLowerCase().includes('birthday'));
  console.log('✓ Birthday message generation passed:', birthdayMessages[0].text);

  // Test 4: Message Refinements
  console.log('Test 4: Message refinement actions...');
  const warmRefined = await orchestrator.refineMessage(birthdayMessages[0].text, 'warmer');
  assert.ok(warmRefined.length > 0);
  const shorterRefined = await orchestrator.refineMessage(birthdayMessages[0].text, 'shorter');
  assert.ok(shorterRefined.length <= birthdayMessages[0].text.length);
  const funnyRefined = await orchestrator.refineMessage(birthdayMessages[0].text, 'funnier');
  assert.ok(funnyRefined.includes('😉') || funnyRefined.includes('favorite'));
  console.log('✓ Message refinements passed (warmer, shorter, funnier)');

  // Test 5: Usage & Billing Service
  console.log('Test 5: Usage and billing rules...');
  const user = usageService.getUser('user_test_mock');
  assert.strictEqual(user.freeCreationsRemaining, 1);

  // Free check
  const checkFree = usageService.checkCanCreate('user_test_mock', { isArtistic: false });
  assert.strictEqual(checkFree.allowed, true);

  // Consume free creation
  const consume1 = usageService.consumeCreation('user_test_mock', { isArtistic: false });
  assert.strictEqual(consume1.success, true);
  assert.strictEqual(consume1.user.freeCreationsRemaining, 0);

  // Check when out of free creations
  const checkEmpty = usageService.checkCanCreate('user_test_mock', { isArtistic: false });
  assert.strictEqual(checkEmpty.allowed, false);
  assert.strictEqual(checkEmpty.price, 0.99);

  // Artistic check requires payment
  const checkArtistic = usageService.checkCanCreate('user_test_mock', { isArtistic: true });
  assert.strictEqual(checkArtistic.allowed, false);

  // Upgrade to Creative Pro
  usageService.updatePlan('user_test_mock', 'creative_pro');
  const checkPro = usageService.checkCanCreate('user_test_mock', { isArtistic: true });
  assert.strictEqual(checkPro.allowed, true);
  console.log('✓ Usage and billing limits strictly enforced');

  // Clean up mock user
  usageService.deleteUserData('user_test_mock');

  console.log('\n🎉 ALL DEARLY UNIT & SERVICE TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

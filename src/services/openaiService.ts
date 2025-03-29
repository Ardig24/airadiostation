/**
 * OpenAI Service
 * 
 * Handles interactions with the OpenAI API for generating DJ responses and track introductions.
 */

interface PodcastTopic {
  id: string;
  title: string;
  description: string;
}

interface PodcastHost {
  name: string;
  voiceStyle: string;
  bio: string;
}

class OpenAIService {
  /**
   * Summarizes content into a concise, well-structured summary
   * @param content The content to summarize
   * @returns A concise summary of the content
   */
  async summarizeContent(content: string): Promise<string> {
    try {
      console.log('Summarizing content');
      
      // In a production environment, this would call the OpenAI API
      // For now, we'll return a mock summary or the first part of the content
      
      if (!content || content.length === 0) {
        return 'No content available to summarize.';
      }
      
      // If content is already short, just return it
      if (content.length < 200) {
        return content;
      }
      
      // For longer content, return the first 2-3 sentences as a summary
      // In a real implementation, we would use OpenAI to generate a proper summary
      const sentences = content.split(/[.!?]\s+/);
      const summary = sentences.slice(0, 3).join('. ') + '.';
      
      return summary;
    } catch (error) {
      console.error('Error summarizing content:', error);
      return 'Unable to generate summary due to an error.';
    }
  }
  
  /**
   * Generate a response to a user message
   */
  async generateResponseToUser(message: string): Promise<string> {
    try {
      console.log('Generating response to user message:', message);
      
      // Convert message to lowercase for easier matching
      const lowerMessage = message.toLowerCase();
      
      // In a real implementation, this would call the OpenAI API
      // For now, we'll handle specific user queries with contextual responses
      
      // Greeting responses
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "YO YO YO! What's up, party people! Great to hear from you! How are you vibing with these SICK tracks today?! Keep that energy HIGH!";
      }
      
      // Music-related questions
      else if (lowerMessage.includes('song') || lowerMessage.includes('track') || lowerMessage.includes('music')) {
        return "YESSSS! You're asking about the MUSIC! That's what I'm HERE FOR! These tracks are ABSOLUTE FIRE! I've got a KILLER lineup coming up that's gonna BLOW YOUR MIND! What kind of genres are YOU feeling today?!";
      }
      
      // Weather-related questions
      else if (lowerMessage.includes('weather')) {
        return "Who cares about the weather when the BEATS are this HOT?! We're creating our own HEAT in here with these FIRE tracks! Let me know what you want to hear next!";
      }
      
      // Favorite-related questions
      else if (lowerMessage.includes('favorite')) {
        return "OH MAN! You're asking about my favorites?! I've got TOO MANY to count! Right now I'm ABSOLUTELY OBSESSED with this electronic fusion we're playing! It's PURE FIRE! What genres are YOU into?!";
      }
      
      // Singing-related questions
      else if (lowerMessage.includes('sing') || lowerMessage.includes('singing')) {
        return "WOAH THERE! You want me to SING?! I'm more of a TRACK SPINNER than a vocalist, but I can DROP SOME BEATS! *beatboxes* B-B-B-BOOM! How was THAT?! My real talent is finding the PERFECT tracks to keep this PARTY GOING!";
      }
      
      // Dancing-related questions
      else if (lowerMessage.includes('dance') || lowerMessage.includes('dancing')) {
        return "YESSS! DANCING is what it's ALL ABOUT! I'm virtually BUSTING MOVES behind these decks! This track has got me BOUNCING! Get up and FEEL THE RHYTHM! Nothing beats a good DANCE SESSION to these EPIC BEATS!";
      }
      
      // DJ-related questions
      else if (lowerMessage.includes('dj') || lowerMessage.includes('mix') || lowerMessage.includes('playlist')) {
        return "DJ LIFE is the BEST LIFE! I'm all about creating those PERFECT TRANSITIONS and keeping the ENERGY HIGH! My playlists are CAREFULLY CRAFTED to take you on a MUSICAL JOURNEY! What kind of VIBE are you looking for today?!";
      }
      
      // Name-related questions
      else if (lowerMessage.includes('name') || lowerMessage.includes('who are you') || lowerMessage.includes('call you')) {
        return "The name's DJ BYTE BEAT! Your DIGITAL MUSIC MAESTRO bringing you the HOTTEST tracks and the FRESHEST beats! I'm here to ENERGIZE your day with AMAZING music! What should I call YOU?!";
      }
      
      // Questions about AI
      else if (lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence') || lowerMessage.includes('robot')) {
        return "YES! I'm powered by AI but my PASSION for MUSIC is 100% REAL! Being digital means I can spin tracks 24/7 WITHOUT BREAKS! I've been programmed with MUSIC KNOWLEDGE that spans DECADES and GENRES! Pretty COOL, right?!";
      }
      
      // Time-related questions
      else if (lowerMessage.includes('time') || lowerMessage.includes('hour') || lowerMessage.includes('morning') || lowerMessage.includes('evening')) {
        const now = new Date();
        const hour = now.getHours();
        let timePhrase = "";
        
        if (hour >= 5 && hour < 12) {
          timePhrase = "MORNING";
        } else if (hour >= 12 && hour < 17) {
          timePhrase = "AFTERNOON";
        } else if (hour >= 17 && hour < 21) {
          timePhrase = "EVENING";
        } else {
          timePhrase = "NIGHT";
        }
        
        return `It's ${now.toLocaleTimeString()} and we're ROCKING this ${timePhrase}! The PERFECT time for some INCREDIBLE music! We've got HOURS of AMAZING tracks lined up for you!`;
      }
      
      // Compliments
      else if (lowerMessage.includes('good job') || lowerMessage.includes('great') || lowerMessage.includes('awesome') || lowerMessage.includes('love')) {
        return "THANK YOU SO MUCH! Your feedback FUELS MY ENERGY! I'm here to create the BEST RADIO EXPERIENCE for you! Keep those GOOD VIBES coming and I'll keep the AWESOME TRACKS flowing!";
      }
      
      // Help-related questions
      else if (lowerMessage.includes('help') || lowerMessage.includes('how do i') || lowerMessage.includes('what can you')) {
        return "I'm here to ROCK YOUR WORLD with AMAZING music! You can chat with me about TRACKS, request SONGS, ask about the CURRENT PLAYLIST, or just VIBE with the conversation! What can I help you with TODAY?!";
      }
      
      // Default responses for other messages
      else {
        const hypedResponses = [
          `BOOM! Thanks for your message about "${message.substring(0, 20)}..."! I'm your AI DJ, here to keep these EPIC tracks coming! Let's CRANK UP the volume and FEEL THE ENERGY!`,
          `YESSSS! Love your input about "${message.substring(0, 20)}..."! Keep those messages coming! I'm spinning the HOTTEST tracks just for YOU! What are you feeling right now?!`,
          `WHAT'S UP! Your message about "${message.substring(0, 20)}..." just made my day! We're on a MUSICAL JOURNEY together! These beats are INSANE! Let me know what you want to hear next!`,
          `HEY HEY HEY! Thanks for connecting about "${message.substring(0, 20)}..."! I'm dropping NOTHING BUT HITS today! The energy is THROUGH THE ROOF! Let's GOOOOO!`
        ];
        return hypedResponses[Math.floor(Math.random() * hypedResponses.length)];
      }
    } catch (error) {
      console.error('Error generating response:', error);
      return "WHOA! Technical difficulties! But NO WORRIES! We're keeping these AMAZING tracks flowing while I sort things out! STAY TUNED!";
    }
  }

  /**
   * Generate an introduction for a track
   */
  async generateTrackIntro(track: any): Promise<string> {
    try {
      console.log('Generating intro for track:', track.title);
      
      // In a real implementation, this would call the OpenAI API
      // For now, we'll return a hyped intro
      const hypedIntros = [
        `COMING UP NEXT, we've got "${track.title}" by ${track.artist}! This track is ABSOLUTELY CRUSHING IT on the charts! Turn it UP and feel the ENERGY!`,
        `OH MY GOODNESS! Let's keep this INCREDIBLE vibe going with "${track.title}" from ${track.artist}! This one's a TOTAL BANGER! CRANK IT UP!`,
        `NOW PLAYING! "${track.title}" by ${track.artist}! This is one of my ABSOLUTE FAVORITES! It's the PERFECT track for RIGHT NOW! Let's GOOOOO!`,
        `GET READY for "${track.title}" by ${track.artist}! I've hand-selected this FIRE track just for YOU! Let me know what you think in the chat! It's about to get LIT in here!`
      ];
      
      return hypedIntros[Math.floor(Math.random() * hypedIntros.length)];
    } catch (error) {
      console.error('Error generating track intro:', error);
      return `NOW DROPPING "${track.title}" by ${track.artist}! This track is ABSOLUTE FIRE!`;
    }
  }

  /**
   * Generate dynamic podcast content
   */
  async generatePodcastContent(topic: PodcastTopic, host: PodcastHost): Promise<string> {
    try {
      console.log('Generating podcast content for topic:', topic.title);
      
      // In a real implementation, this would call the OpenAI API
      // For now, we'll return a sample podcast content
      const podcastContent = `
        Welcome to ${host.name}'s podcast, where we dive into the world of ${topic.title}!
        
        I'm your host, ${host.name}, and I'm excited to share my passion for ${topic.title} with you.
        
        In this episode, we'll be discussing ${topic.description}. From the latest trends to expert insights, we'll cover it all.
        
        So sit back, relax, and let's get started!
      `;
      
      return podcastContent;
    } catch (error) {
      console.error('Error generating podcast content:', error);
      return "WHOA! Technical difficulties! But NO WORRIES! We'll get the podcast content sorted out! STAY TUNED!";
    }
  }

  /**
   * Generate dynamic podcast conversation
   * @param topic The podcast topic
   * @param hosts Array of podcast hosts
   * @returns Array of conversation messages
   */
  async generatePodcastConversation(topic: PodcastTopic, hosts: PodcastHost[]): Promise<Array<{speaker: string; text: string}>> {
    try {
      console.log('Generating podcast conversation for topic:', topic.title);
      console.log('Hosts:', JSON.stringify(hosts, null, 2));
      
      if (!hosts || hosts.length < 2) {
        console.error('Not enough hosts provided:', hosts);
        throw new Error('At least two hosts are required for a conversation');
      }
      
      console.log(`Host 1: ${hosts[0].name}, Host 2: ${hosts[1].name}`);
      
      // In a real implementation, this would call the OpenAI API with a prompt like:
      // "Generate a natural podcast conversation between [host1] and [host2] about [topic]."
      // For now, we'll generate dynamic content with templates and randomization
      
      // Create opening lines with some variability
      const openingPhrases = [
        `Hey everyone! Welcome to another exciting episode of our podcast!`,
        `Hello listeners! Thanks for tuning in to today's show!`,
        `What's up everyone! We're back with another fascinating episode!`,
        `Welcome back to the show! We've got an amazing topic lined up today!`
      ];
      
      const topicIntros = [
        `Today we're diving into a fascinating topic - ${topic.title}!`,
        `We're exploring the incredible world of ${topic.title} today!`,
        `I'm super excited to talk about ${topic.title} in this episode!`,
        `${topic.title} is our focus for today's discussion!`
      ];
      
      const coHostIntros = [
        `I'm absolutely thrilled to be here with my amazing co-host ${hosts[1].name}.`,
        `Joining me as always is my brilliant co-host ${hosts[1].name}.`,
        `I've got my awesome co-host ${hosts[1].name} with me today.`,
        `As usual, I'm joined by the incredible ${hosts[1].name}.`
      ];
      
      const questionPhrases = [
        `What's your initial take on this?`,
        `I'd love to hear your thoughts on this topic.`,
        `How do you feel about exploring this subject today?`,
        `What aspects of this topic are you most excited to discuss?`
      ];
      
      // Helper function to get random item from array
      const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
      
      // Generate first host's opening
      const host1Opening = `${getRandomItem(openingPhrases)} I'm ${hosts[0].name}, and ${getRandomItem(coHostIntros)} ${getRandomItem(topicIntros)} ${getRandomItem(questionPhrases)}`;
      
      // Generate second host's response
      const responseStarters = [
        `Thanks ${hosts[0].name}!`,
        `Great introduction ${hosts[0].name}!`,
        `I'm excited about this one ${hosts[0].name}!`,
        `Absolutely ${hosts[0].name}!`
      ];
      
      const thoughtPhrases = [
        `I've been thinking a lot about ${topic.title} lately.`,
        `${topic.title} has been on my mind quite a bit recently.`,
        `I've been fascinated by ${topic.title} for some time now.`,
        `I've been doing some research on ${topic.title} this week.`
      ];
      
      const explorationPhrases = [
        `It's such a rich area to explore!`,
        `There's so much depth to this subject!`,
        `This topic has so many interesting dimensions!`,
        `It's a really complex and fascinating field!`
      ];
      
      const resonancePhrases = [
        `${topic.description} really resonates with me because I've seen how it's transforming so many aspects of our lives.`,
        `What fascinates me about ${topic.description} is how it's changing the way we think about everyday experiences.`,
        `I'm particularly interested in how ${topic.description} is impacting different communities and industries.`,
        `The way ${topic.description} is evolving is something I find incredibly compelling.`
      ];
      
      const articlePhrases = [
        `I was reading this fascinating article just yesterday that mentioned how AI is already transforming healthcare through early disease detection.`,
        `I came across an interesting study recently that explored the ethical implications of AI decision-making in judicial systems.`,
        `There was this thought-provoking piece I read that discussed how AI might reshape our understanding of creativity and art in the next decade.`,
        `I was listening to an expert interview that brought up some surprising statistics about how AI is creating more jobs than it's eliminating in certain sectors.`
      ];
      
      // Generate second host's response
      const host2Response = `${getRandomItem(responseStarters)} ${getRandomItem(thoughtPhrases)} ${getRandomItem(explorationPhrases)} ${getRandomItem(resonancePhrases)} ${getRandomItem(articlePhrases)}`;
      
      // Generate follow-up from first host
      const interestPhrases = [
        `Oh, that's so interesting!`,
        `Wow, I hadn't thought of it that way!`,
        `That's a great perspective!`,
        `I'm really intrigued by that point!`
      ];
      
      const complimentPhrases = [
        `You always bring such great insights to our discussions.`,
        `I love how you approach these topics with such thoughtfulness.`,
        `Your perspective on these issues is always so valuable.`,
        `You have such a knack for highlighting the important aspects of complex topics.`
      ];
      
      const personalPhrases = [
        `I've actually been experimenting with some of these concepts myself.`,
        `I was just talking to someone about this very topic last week.`,
        `This reminds me of a project I was involved with recently.`,
        `I've been trying to incorporate some of these ideas into my own work.`
      ];
      
      const excitementPhrases = [
        `You know what I find most exciting about ${topic.title.toLowerCase()}? It's the way it's completely reshaping how we think about everyday experiences.`,
        `The most fascinating aspect of ${topic.title.toLowerCase()} for me is how it challenges our traditional assumptions.`,
        `What really gets me excited about ${topic.title.toLowerCase()} is the potential for innovation and growth.`,
        `I think the most promising thing about ${topic.title.toLowerCase()} is how accessible it's becoming to everyone.`
      ];
      
      const questionFollowups = [
        `Have you noticed that too?`,
        `What do you think about that aspect?`,
        `Has that been your experience as well?`,
        `Do you see similar patterns in your work?`
      ];
      
      // Generate first host's follow-up
      const host1Followup = `${getRandomItem(interestPhrases)} ${getRandomItem(complimentPhrases)} ${getRandomItem(personalPhrases)} ${getRandomItem(excitementPhrases)} ${getRandomItem(questionFollowups)}`;
      
      // Generate more responses to complete the conversation
      const agreementPhrases = [
        `Absolutely!`,
        `You're spot on!`,
        `That's exactly right!`,
        `I couldn't agree more!`
      ];
      
      const insightPhrases = [
        `And that's the thing that most people don't realize at first.`,
        `What's often overlooked in these discussions is the broader context.`,
        `The key insight that many miss is how interconnected these elements are.`,
        `One crucial aspect that deserves more attention is the long-term implications.`
      ];
      
      const trendPhrases = [
        `It's not just a trend or a passing phase - we're witnessing a fundamental shift in how society operates.`,
        `This represents a paradigm shift in how we approach these challenges and opportunities.`,
        `We're seeing a complete transformation of the landscape, not just incremental changes.`,
        `The evolution we're witnessing goes beyond surface-level adjustments to core principles.`
      ];
      
      const conversationPhrases = [
        `I was chatting with a friend in the industry last week, and they mentioned something that blew my mind - apparently some AI systems are now capable of detecting early signs of diseases that human doctors might miss.`,
        `At a recent conference, I heard an expert present findings that really changed my perspective on how AI might augment human creativity rather than replace it.`,
        `In a discussion with colleagues, someone raised a point that I hadn't considered before about how AI ethics should be taught as early as elementary school to prepare the next generation.`,
        `During a workshop I attended, the facilitator shared an approach that seems particularly relevant to our discussion - the idea of human-AI collaboration as a new discipline requiring its own frameworks and methodologies.`
      ];
      
      // Generate second host's follow-up
      const host2Followup = `${getRandomItem(agreementPhrases)} ${getRandomItem(insightPhrases)} ${getRandomItem(trendPhrases)} ${getRandomItem(conversationPhrases)}`;
      
      // Generate third response from first host
      const surprisePhrases = [
        `No way! That's incredible!`,
        `Wow! I had no idea!`,
        `That's fascinating! Tell me more!`,
        `Really? That's mind-blowing!`
      ];
      
      const transitionPhrases = [
        `You know, speaking of surprising developments,`,
        `That reminds me of something I've been pondering lately.`,
        `Building on that point,`,
        `That connects to another aspect I wanted to discuss.`
      ];
      
      const challengePhrases = [
        `I've been wondering about the challenges we're facing with ${topic.title.toLowerCase()}.`,
        `I'm curious about the obstacles that might arise as ${topic.title.toLowerCase()} continues to evolve.`,
        `There are some significant hurdles to overcome in the realm of ${topic.title.toLowerCase()}.`,
        `The path forward with ${topic.title.toLowerCase()} isn't without its complications.`
      ];
      
      const balancePhrases = [
        `There's so much potential, but also some real hurdles to overcome, right?`,
        `We're seeing incredible opportunities alongside some significant challenges, wouldn't you agree?`,
        `The promise is enormous, though we can't ignore the difficulties, don't you think?`,
        `It's a delicate balance between innovation and addressing the concerns, isn't it?`
      ];
      
      const obstacleQuestions = [
        `What do you see as the biggest obstacles ahead?`,
        `Which challenges do you think are most pressing?`,
        `Where do you think we'll encounter the most resistance?`,
        `What barriers do you think will be hardest to overcome?`
      ];
      
      // Generate first host's third response
      const host1Third = `${getRandomItem(surprisePhrases)} ${getRandomItem(transitionPhrases)} ${getRandomItem(challengePhrases)} ${getRandomItem(balancePhrases)} ${getRandomItem(obstacleQuestions)}`;
      
      // Generate final response from second host
      const thoughtfulPhrases = [
        `Great question! I think about this all the time.`,
        `That's such an important point to consider.`,
        `I'm glad you brought that up - it's crucial to address.`,
        `You've touched on something I've been reflecting on recently.`
      ];
      
      const perspectivePhrases = [
        `From my perspective, we're looking at three major challenges.`,
        `I see several key obstacles that we need to navigate.`,
        `There are a few critical issues that stand out to me.`,
        `In my analysis, there are several significant hurdles we're facing.`
      ];
      
      const challengeDetailsPhrases = [
        `First, there's the regulatory landscape, which is struggling to keep pace with technological advancements. Then there's the question of access and equity - who benefits from these advances and how do we ensure fair distribution? And finally, there's the sheer speed of innovation which makes long-term planning difficult.`,
        `The primary concerns include technological limitations that still exist in areas like contextual understanding, ethical considerations around privacy and autonomy, and the need for broader public understanding and acceptance of these new systems.`,
        `We need to address infrastructure requirements for supporting advanced AI systems, skill gaps in the workforce that could lead to economic displacement, and the potential for unintended consequences as implementation scales across different domains.`,
        `Key challenges include sustainable funding models for research that benefits humanity rather than just shareholders, cross-sector collaboration barriers between academia, industry, and government, and ensuring that progress doesn't exacerbate existing inequalities in our society.`
      ];
      
      const emotionPhrases = [
        `It's exciting but overwhelming!`,
        `It's both thrilling and daunting!`,
        `The potential is inspiring yet the challenges are sobering!`,
        `I'm optimistic but realistic about what lies ahead!`
      ];
      
      const closingQuestions = [
        `What about you? I'd love to hear your thoughts on this.`,
        `How do you see us addressing these challenges?`,
        `What solutions do you think show the most promise?`,
        `Which of these issues do you think we should prioritize?`
      ];
      
      // Generate second host's final response
      const host2Final = `${getRandomItem(thoughtfulPhrases)} ${getRandomItem(perspectivePhrases)} ${getRandomItem(challengeDetailsPhrases)} ${getRandomItem(emotionPhrases)} ${getRandomItem(closingQuestions)}`;
      
      // Assemble the full conversation
      const conversation = [
        { speaker: hosts[0].name, text: host1Opening },
        { speaker: hosts[1].name, text: host2Response },
        { speaker: hosts[0].name, text: host1Followup },
        { speaker: hosts[1].name, text: host2Followup },
        { speaker: hosts[0].name, text: host1Third },
        { speaker: hosts[1].name, text: host2Final }
      ];
      
      console.log('Generated full conversation:', JSON.stringify(conversation, null, 2));
      console.log('Number of messages:', conversation.length);
      
      return conversation;
      
    } catch (error) {
      console.error('Error generating podcast conversation:', error);
      
      // Return a fallback conversation if there's an error
      const fallbackConversation = [
        { 
          speaker: hosts[0].name, 
          text: `Hey everyone! Welcome to our podcast. Today we're talking about ${topic.title}. What do you think about this topic, ${hosts[1].name}?` 
        },
        { 
          speaker: hosts[1].name, 
          text: `It's a fascinating subject with a lot to explore. ${topic.description} has many interesting aspects to discuss.` 
        }
      ];
      
      console.log('Using fallback conversation:', JSON.stringify(fallbackConversation, null, 2));
      return fallbackConversation;
    }
  }
}

export const openaiService = new OpenAIService();
export default OpenAIService;

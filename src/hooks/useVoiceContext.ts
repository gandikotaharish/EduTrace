import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { setVoiceContext, resetVoiceContext } from '@/ai/voice-engine';

interface ConceptContext {
  conceptName?: string;
  conceptExplanation?: string;
  subjectName?: string;
}

/**
 * Call from pages to set voice assistant context (page, concept).
 * Pass concept details when on a concept page.
 */
export function useVoiceContext(concept?: ConceptContext | null) {
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    const route = location.pathname;
    let page = 'Dashboard';
    if (route.startsWith('/student/learn')) page = 'Learning';
    else if (route.startsWith('/student')) page = 'Student';
    else if (route.startsWith('/teacher')) page = 'Teacher';
    else if (route.startsWith('/admin')) page = 'Admin';

    setVoiceContext({
      page,
      route,
      conceptId: params.conceptId,
      conceptName: concept?.conceptName,
      conceptExplanation: concept?.conceptExplanation,
      subjectName: concept?.subjectName,
    });
    return () => resetVoiceContext();
  }, [location.pathname, params.conceptId, concept?.conceptName, concept?.conceptExplanation, concept?.subjectName]);
}

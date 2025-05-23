import type { ChangeEvent, SetStateAction } from "react";
import { useCallback } from "react";
import {
  VscodeOption,
  VscodeSingleSelect,
} from "@vscode-elements/react-elements";

import type { CodeFlow } from "../../../variant-analysis/shared/analysis-result";

const getCodeFlowName = (codeFlow: CodeFlow) => {
  const filePath =
    codeFlow.threadFlows[codeFlow.threadFlows.length - 1].fileLink.filePath;
  return filePath.substring(filePath.lastIndexOf("/") + 1);
};

type CodeFlowsDropdownProps = {
  codeFlows: CodeFlow[];
  selectedCodeFlow: CodeFlow;
  setSelectedCodeFlow: (value: SetStateAction<CodeFlow>) => void;
};

export const CodeFlowsDropdown = ({
  codeFlows,
  selectedCodeFlow,
  setSelectedCodeFlow,
}: CodeFlowsDropdownProps) => {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const selectedOption = e.target;
      const selectedIndex = parseInt(selectedOption.value);
      setSelectedCodeFlow(codeFlows[selectedIndex]);
    },
    [setSelectedCodeFlow, codeFlows],
  );

  const value = codeFlows
    .findIndex((codeFlow) => selectedCodeFlow === codeFlow)
    .toString();

  return (
    <VscodeSingleSelect value={value} onChange={handleChange}>
      {codeFlows.map((codeFlow, index) => (
        <VscodeOption key={index} value={index.toString()}>
          {getCodeFlowName(codeFlow)}
        </VscodeOption>
      ))}
    </VscodeSingleSelect>
  );
};
